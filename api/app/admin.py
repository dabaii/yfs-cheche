from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, ActiveCar, Prize, Seat, Address, Store, ItemRecord, ShippingRecord

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('勇者魔法钱包', {'fields': ('balance',)}),
    )
    list_display = ('username', 'email', 'balance', 'is_staff')

class PrizeInline(admin.TabularInline):
    model = Prize
    extra = 0

class SeatInline(admin.TabularInline):
    model = Seat
    extra = 0

@admin.register(ActiveCar)
class ActiveCarAdmin(admin.ModelAdmin):
    list_display = ('name', 'total_seats', 'price', 'status', 'created_at')
    inlines = [PrizeInline, SeatInline]
    list_filter = ('status',)
    search_fields = ('name',)

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'phone', 'is_default')

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'hours')

@admin.register(ItemRecord)
class ItemRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'prize', 'car', 'seat_number', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('user__username', 'prize__name', 'car__name')

@admin.register(ShippingRecord)
class ShippingRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'method', 'status', 'created_at')
    list_filter = ('method', 'status')
    filter_horizontal = ('items',)
