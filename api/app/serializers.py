from rest_framework import serializers
from .models import CustomUser, ActiveCar, Prize, Seat, Address, Store, ItemRecord, ShippingRecord

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'balance', 'is_staff']

class PrizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prize
        fields = '__all__'

class ActiveCarSerializer(serializers.ModelSerializer):
    prizes = PrizeSerializer(many=True, read_only=True)
    totalSeats = serializers.IntegerField(source='total_seats', read_only=True)
    occupiedSeats = serializers.SerializerMethodField()
    results = serializers.SerializerMethodField()
    
    class Meta:
        model = ActiveCar
        fields = ['id', 'name', 'totalSeats', 'price', 'discount', 'description', 'status', 'prizes', 'occupiedSeats', 'results']

    def get_occupiedSeats(self, obj):
        seats = obj.seats.all()
        # Ensure we return an object with seat_number as key, like { "1": { "name": "..." }, ... }
        mapping = {}
        for seat in seats:
            if seat.owner:
                mapping[str(seat.seat_number)] = {
                    "uid": seat.owner.username,
                    "name": seat.owner.first_name or seat.owner.username
                }
        return mapping

    def get_results(self, obj):
        res = [{"type": "?", "name": "未掉落"} for _ in range(obj.total_seats)]
        items = obj.itemrecord_set.all() if hasattr(obj, 'itemrecord_set') else []
        for item in items:
            idx = item.seat_number - 1
            if 0 <= idx < len(res):
                res[idx] = {"type": item.prize.type, "name": item.prize.name}
        return res

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ['user']

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = '__all__'

class ItemRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemRecord
        fields = '__all__'

class ShippingRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingRecord
        fields = '__all__'
