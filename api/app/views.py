from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import CustomUser, ActiveCar, Address, Store, ItemRecord, ShippingRecord
from .serializers import ActiveCarSerializer, AddressSerializer, StoreSerializer, ShippingRecordSerializer

class DisableCSRFForAPIMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        if request.path.startswith('/api/'):
            request._dont_enforce_csrf_checks = True
        return self.get_response(request)

class BaseResponse:
    @staticmethod
    def success(data=None, message="success", code=200):
        return Response({"success": True, "code": code, "message": message, "data": data}, status=code)

    @staticmethod
    def error(message="error", code=400, data=None):
        return Response({"success": False, "code": code, "message": message, "data": data}, status=code)

class ActiveCarViewSet(viewsets.ModelViewSet):
    queryset = ActiveCar.objects.all()
    serializer_class = ActiveCarSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return BaseResponse.success(serializer.data)

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer

    def get_queryset(self):
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            return Address.objects.filter(user=self.request.user)
        return Address.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return BaseResponse.success(serializer.data)
        
    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return BaseResponse.error("请先登录")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return BaseResponse.success(serializer.data, message="保存成功")

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return BaseResponse.success(serializer.data, message="更新成功")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return BaseResponse.success(message="删除成功")

def get_user_dict(user):
    items = user.items.filter(status='in_warehouse') if hasattr(user, 'items') else []
    item_list = []
    for item in items:
        item_list.append({
            "id": item.id,
            "type": item.prize.type,
            "name": item.prize.name,
            "carName": item.car.name,
            "seat": str(item.seat_number),
            "timestamp": item.id,
            "status": item.status
        })
    
    return {
        "id": user.id,
        "name": user.first_name or user.username,
        "balance": float(user.balance),
        "items": item_list,
        "isLoggedIn": True,
        "role": "admin" if user.is_staff else "user",
    }

@api_view(['GET'])
def user_profile(request):
    if not request.user.is_authenticated:
        return BaseResponse.success({
            "id": None,
            "name": "访客",
            "balance": 0,
            "items": [],
            "isLoggedIn": False,
            "role": "user"
        })
    return BaseResponse.success(get_user_dict(request.user))

@api_view(['GET'])
def store_list(request):
    stores = Store.objects.all()
    return BaseResponse.success(StoreSerializer(stores, many=True).data)

@api_view(['GET'])
def shipping_history(request):
    if not request.user.is_authenticated:
        return BaseResponse.success([])
    history = ShippingRecord.objects.filter(user=request.user).prefetch_related('items__prize').order_by('-created_at')
    return BaseResponse.success(ShippingRecordSerializer(history, many=True).data)

from django.contrib.auth import authenticate, login, logout

@api_view(['POST'])
def auth_send_code(request):
    # In dev, we just pretend it's sent and code is 111111
    return BaseResponse.success(message="验证码已发送 (默认 111111)")

@api_view(['POST'])
def auth_login(request):
    phone = request.data.get('phone')
    code = request.data.get('code')
    
    if not phone:
        return BaseResponse.error("请输入手机号码")
    if code != '111111':
        return BaseResponse.error("验证码错误")

    # Check if user exists, else auto-register
    user, created = CustomUser.objects.get_or_create(username=phone)
    if created:
        user.set_unusable_password()
        user.save()
        
    login(request, user)
    return BaseResponse.success(get_user_dict(user), message="登录成功" if not created else "注册并登录成功")

@api_view(['POST'])
def auth_logout(request):
    logout(request)
    return BaseResponse.success(None)

@api_view(['POST'])
def auth_register(request):
    # This might be deprecated but kept for safety or updated to match auto-reg
    return auth_login(request)

@api_view(['POST'])
def auth_forgot(request):
    phone = request.data.get('phone')
    code = request.data.get('code')
    if code != '111111':
        return BaseResponse.error("验证码错误")
    
    try:
        user = CustomUser.objects.get(username=phone)
        # For code-based login projects, "forgot" might just be another login path
        login(request, user)
        return BaseResponse.success(get_user_dict(user), message="身份验证成功")
    except CustomUser.DoesNotExist:
        return BaseResponse.error("该手机号码尚未参与冒险")

@api_view(['POST'])
def admin_grant(request):
    target_phone = request.data.get('phone')
    try:
        target_user = CustomUser.objects.get(username=target_phone)
        target_user.is_staff = True
        target_user.save()
        return BaseResponse.success(message=f"已成功赋予 {target_user.username} 管理员权限")
    except CustomUser.DoesNotExist:
        return BaseResponse.error("用户不存在")

from django.db import transaction
from decimal import Decimal
import random

@api_view(['POST'])
def car_join(request, pk):
    if not request.user.is_authenticated:
        return BaseResponse.error("请先登录")

    try:
        count = int(request.data.get('count', 0))
    except (ValueError, TypeError):
        return BaseResponse.error("数量格式错误")

    if count <= 0:
        return BaseResponse.error("数量必须大于0")

    try:
        car = ActiveCar.objects.get(pk=pk)
    except ActiveCar.DoesNotExist:
        return BaseResponse.error("车队不存在")

    if car.status != 'open':
        return BaseResponse.error("该车队已经发车或结束")

    from .models import Seat, ItemRecord

    with transaction.atomic():
        # Lock user for balance update
        user = CustomUser.objects.select_for_update().get(pk=request.user.pk)
        
        # Compute cost securely
        cost_per_seat = Decimal(str(car.price)) * Decimal(str(car.discount)) / Decimal('100')
        total_cost = cost_per_seat * count
        
        if user.balance < total_cost:
            return BaseResponse.error(f"金币能量不足，需要 ¥{total_cost}")

        # Get occupied seats
        occupied = set(Seat.objects.filter(car=car).values_list('seat_number', flat=True))
        available = [i for i in range(1, car.total_seats + 1) if i not in occupied]

        if len(available) < count:
            return BaseResponse.error(f"余座不足，当前仅剩 {len(available)} 个席位")

        # Pick seats sequentially
        chosen_seats = available[:count]
        seats_to_create = []
        for seat_num in chosen_seats:
            seats_to_create.append(Seat(car=car, seat_number=seat_num, owner=user))
        
        Seat.objects.bulk_create(seats_to_create)

        # Deduct balance
        user.balance -= total_cost
        user.save()

        # Check if car is full
        if len(occupied) + count == car.total_seats:
            car.status = 'unboxed'
            car.save()

            # Process blind box results
            prizes = []
            for prize in car.prizes.all():
                prizes.extend([prize] * prize.count)
            
            # Shuffle prizes to randomize
            random.shuffle(prizes)

            all_seats = Seat.objects.filter(car=car).order_by('seat_number')
            item_records = []
            
            for index, seat in enumerate(all_seats):
                if index < len(prizes):
                    item_records.append(ItemRecord(
                        user=seat.owner,
                        prize=prizes[index],
                        car=car,
                        seat_number=seat.seat_number,
                        status='in_warehouse'
                    ))
            
            ItemRecord.objects.bulk_create(item_records)

    return BaseResponse.success(None, message="成功占据席位！")

@api_view(['POST'])
def car_create(request):
    return BaseResponse.success({}, message="全新盲盒上架！")

import string

def generate_pickup_code():
    while True:
        code = ''.join(random.choices(string.digits, k=4))
        # Unique among active pickup orders
        if not ShippingRecord.objects.filter(pickup_code=code, status='等待勇者').exists():
            return code

@api_view(['POST'])
def submit_shipping(request):
    if not request.user.is_authenticated:
        return BaseResponse.error("请先登录")

    items_data = request.data.get('items', [])
    method = request.data.get('method', 'express')
    receiver_info = request.data.get('receiver_info', '')

    if not items_data:
        return BaseResponse.error("请选择要传送的物品")

    # Extract item IDs
    item_ids = [item.get('id') or item.get('timestamp') for item in items_data if isinstance(item, dict)]
    if not item_ids:
        return BaseResponse.error("物品数据格式错误")

    with transaction.atomic():
        user_items = ItemRecord.objects.filter(
            id__in=item_ids,
            user=request.user,
            status='in_warehouse'
        ).select_for_update()

        if user_items.count() == 0:
            return BaseResponse.error("未找到可传送的物品")

        # Logic for status and code
        status = '运输中' if method == 'express' else '等待勇者'
        pickup_code = generate_pickup_code() if method == 'pickup' else None

        record = ShippingRecord.objects.create(
            user=request.user,
            method=method,
            receiver_info=receiver_info,
            pickup_code=pickup_code,
            status=status
        )

        record.items.set(user_items)
        user_items.update(status='shipping')

    record.refresh_from_db()
    serialized = ShippingRecordSerializer(record).data
    return BaseResponse.success(serialized, message="打包请求已被接收！" if method == 'express' else f"自提码: {pickup_code}")

@api_view(['POST'])
def verify_pickup_code(request):
    code = request.data.get('code')
    if not code:
        return BaseResponse.error("请输入自提码")
    
    try:
        record = ShippingRecord.objects.get(pickup_code=code, status='等待勇者')
        return BaseResponse.success(ShippingRecordSerializer(record).data)
    except ShippingRecord.DoesNotExist:
        return BaseResponse.error("未找到有效的自提单，请检查验证码")

@api_view(['GET'])
def list_all_shippings(request):
    if not request.user.is_authenticated or request.user.role != 'admin':
        return BaseResponse.error("权限拒绝")
    
    shippings = ShippingRecord.objects.all()
    serializer = ShippingRecordSerializer(shippings, many=True)
    return BaseResponse.success(serializer.data)

@api_view(['POST'])
def update_shipping_admin(request, pk):
    if not request.user.is_authenticated or request.user.role != 'admin':
        return BaseResponse.error("权限拒绝")
    
    try:
        record = ShippingRecord.objects.get(pk=pk)
    except ShippingRecord.DoesNotExist:
        return BaseResponse.error("记录不存在")
    
    # Update fields from request data
    record.status = request.data.get('status', record.status)
    record.courier_name = request.data.get('courier_name', record.courier_name)
    record.tracking_number = request.data.get('tracking_number', record.tracking_number)
    record.receiver_info = request.data.get('receiver_info', record.receiver_info)
    record.save()
    
    return BaseResponse.success(ShippingRecordSerializer(record).data, message="物流状态更新成功")

@api_view(['POST'])
def balance_recharge(request):
    return BaseResponse.success(None, message="魔力充值成功！")
