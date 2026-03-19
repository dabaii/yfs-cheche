from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=5000.00, verbose_name="金币能量")
    
    class Meta:
        verbose_name = "勇者"
        verbose_name_plural = "勇者(用户)"
    
    def __str__(self):
        return self.username

class ActiveCar(models.Model):
    name = models.CharField(max_length=200, verbose_name="物语标题")
    total_seats = models.IntegerField(verbose_name="席位数")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="基础单价")
    discount = models.IntegerField(default=100, verbose_name="折扣(%)")
    description = models.TextField(verbose_name="前情提要")
    status = models.CharField(max_length=20, default='open', choices=[('open', '销售中'), ('unboxed', '已开箱')], verbose_name="运作状态")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "发售车队"
        verbose_name_plural = "发售车队(商品箱)"

    def __str__(self):
        return self.name

class Prize(models.Model):
    car = models.ForeignKey(ActiveCar, on_delete=models.CASCADE, related_name='prizes', verbose_name="所属车队")
    type = models.CharField(max_length=10, verbose_name="赏级体系(如 SP/A/B)")
    name = models.CharField(max_length=200, verbose_name="奖项名称")
    count = models.IntegerField(verbose_name="原始配置数量")
    img = models.URLField(max_length=500, blank=True, null=True, verbose_name="展示模型URL")

    class Meta:
        verbose_name = "配置奖项"
        verbose_name_plural = "箱体内奖项池"
        
    def __str__(self):
        return f"{self.car.name} - {self.type}赏: {self.name}"

class Seat(models.Model):
    car = models.ForeignKey(ActiveCar, on_delete=models.CASCADE, related_name='seats', verbose_name="所属车队")
    seat_number = models.IntegerField(verbose_name="座位号码")
    owner = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="占坑勇者")
    
    class Meta:
        unique_together = ('car', 'seat_number')
        verbose_name = "排号席位"
        verbose_name_plural = "实时选座概况"

class Address(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='addresses')
    name = models.CharField(max_length=50, verbose_name="接收人代号")
    phone = models.CharField(max_length=50, verbose_name="联络信号")
    detail = models.TextField(verbose_name="详细物理坐标")
    is_default = models.BooleanField(default=False, verbose_name="设为首选着陆点")

    class Meta:
        verbose_name = "坐标字典"
        verbose_name_plural = "勇者坐标地址"

class Store(models.Model):
    name = models.CharField(max_length=200, verbose_name="中介门脸名")
    address = models.TextField(verbose_name="坐落位置")
    hours = models.CharField(max_length=100, default="10:00 - 22:00", verbose_name="魔法交汇时间(营业时间)")

    class Meta:
        verbose_name = "自提次元据点"
        verbose_name_plural = "系统预设线下据点"
        
    def __str__(self):
        return self.name

class ItemRecord(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='items')
    prize = models.ForeignKey(Prize, on_delete=models.CASCADE, verbose_name="掉落原奖项")
    car = models.ForeignKey(ActiveCar, on_delete=models.CASCADE, verbose_name="出处车队")
    seat_number = models.IntegerField(verbose_name="当期摇中座次")
    status = models.CharField(max_length=20, default='in_warehouse', choices=[('in_warehouse','虚空中保留'),('shipping','打包快递中'),('shipped','已完成传送')], verbose_name="当前存留状态")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "稀有战利品"
        verbose_name_plural = "个人仓库掉落实况"

class ShippingRecord(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='shippings')
    items = models.ManyToManyField(ItemRecord, related_name='shipping_orders', verbose_name="被打包的单品")
    method = models.CharField(max_length=20, default='express', verbose_name="传送承制方")
    status = models.CharField(max_length=20, default='打包中', verbose_name="物流跟踪态")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="申请创建刻度")

    class Meta:
        verbose_name = "传送履历归档"
        verbose_name_plural = "物流传送发货总表"
