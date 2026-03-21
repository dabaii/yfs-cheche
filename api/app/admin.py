from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, ActiveCar, Prize, Seat, Address, Store, ItemRecord, ShippingRecord, ExpressCompany

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

@admin.register(ExpressCompany)
class ExpressCompanyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

@admin.register(ShippingRecord)
class ShippingRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id_display', 'method', 'status', 'courier', 'tracking_number', 'shipping_fee', 'created_at')
    list_filter = ('method', 'status')
    search_fields = ('user__username', 'user__phone', 'tracking_number', 'pickup_code')
    readonly_fields = ('user_id_display', 'method', 'items_list_display')
    
    def user_id_display(self, obj):
        return f"UID: {obj.user.id} ({obj.user.username})"
    user_id_display.short_description = "物主身份 ID"

    def items_list_display(self, obj):
        from django.utils.html import format_html
        items = obj.items.all()
        html = "<ul>"
        for i in items:
            html += f"<li>[{i.prize.type}赏] {i.prize.name}</li>"
        html += "</ul>"
        return format_html(html)
    items_list_display.short_description = "本次被打包的物资清单"

    def get_fields(self, request, obj=None):
        # Base fields minus the actual m2m items and user FK
        fields = ['user_id_display', 'method', 'items_list_display', 'status', 'receiver_info', 'pickup_code']
        if obj and obj.method == 'express':
            fields += ['courier', 'tracking_number', 'shipping_fee']
        return fields

    def has_add_permission(self, request):
        # Shipping records should be created via frontend logic, not admin to avoid data inconsistency
        return False
