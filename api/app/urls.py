from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'cars/active', views.ActiveCarViewSet, basename='active_cars')
router.register(r'user/address', views.AddressViewSet, basename='user_addresses')

urlpatterns = [
    path('', include(router.urls)),
    path('user/profile', views.user_profile),
    path('stores', views.store_list),
    path('user/shipping-history', views.shipping_history),
    path('auth/login', views.auth_login),
    path('auth/logout', views.auth_logout),
    path('auth/register', views.auth_register),
    path('auth/forgot-password', views.auth_forgot),
    path('admin/grant', views.admin_grant),
    path('cars/<int:pk>/join', views.car_join),
    path('admin/cars', views.car_create),
    path('user/shipping', views.submit_shipping),
    path('user/balance/recharge', views.balance_recharge),
]
