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
    items = user.items.all() if hasattr(user, 'items') else []
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
    history = ShippingRecord.objects.all()
    return BaseResponse.success(ShippingRecordSerializer(history, many=True).data)

from django.contrib.auth import authenticate, login, logout

@api_view(['POST'])
def auth_login(request):
    phone = request.data.get('phone')
    password = request.data.get('password')
    user = authenticate(request, username=phone, password=password)
    if user is not None:
        login(request, user)
        return BaseResponse.success(get_user_dict(user), message="登录成功")
    return BaseResponse.error("手机号码或密码错误")

@api_view(['POST'])
def auth_logout(request):
    logout(request)
    return BaseResponse.success(None)

@api_view(['POST'])
def auth_register(request):
    phone = request.data.get('phone')
    password = request.data.get('password')
    if not phone or not password:
        return BaseResponse.error("请输入手机号码和密码")
    if CustomUser.objects.filter(username=phone).exists():
        return BaseResponse.error("该手机号码已被注册")
    
    user = CustomUser.objects.create_user(username=phone, password=password)
    login(request, user)
    return BaseResponse.success(get_user_dict(user), message="注册成功")

@api_view(['POST'])
def auth_forgot(request):
    phone = request.data.get('phone')
    new_password = request.data.get('password')
    try:
        user = CustomUser.objects.get(username=phone)
        user.set_password(new_password)
        user.save()
        return BaseResponse.success(message="密码重置成功，请重新登录")
    except CustomUser.DoesNotExist:
        return BaseResponse.error("该手机号码尚未注册")

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

@api_view(['POST'])
def submit_shipping(request):
    return BaseResponse.success({"id": 1, "status": "打包中"}, message="打包请求已被接收！")

@api_view(['POST'])
def balance_recharge(request):
    return BaseResponse.success(None, message="魔力充值成功！")
