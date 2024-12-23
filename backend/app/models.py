from django.contrib.auth.models import BaseUserManager
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError("The phone number must be set")
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(phone_number, password, **extra_fields)

class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, unique=True)  # 手机号字段，唯一
    username = models.CharField(max_length=20, null=True, blank=True)
    avatar = models.TextField(null=True, blank=True)

    USERNAME_FIELD = 'phone_number'  # 登录时以手机号作为唯一标识
    REQUIRED_FIELDS = []  # 其他必填字段为空

    objects = CustomUserManager()

    def __str__(self):
        return self.phone_number

class VerificationCode(models.Model):
    phone_number = models.CharField(max_length=15, unique=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.phone_number} - {self.code}'

class SleepRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sleep_records")
    date = models.DateField(auto_now_add=True)  # 睡眠记录的日期
    sleep_time = models.CharField(max_length=10, default='00:00')  # 入睡时间
    wake_time = models.CharField(max_length=10, default="00:00")  # 起床时间
    screen_on = models.IntegerField(default=-1)  # 亮屏次数
    noise_max = models.IntegerField(default=-1)  # 最大噪音值
    noise_avg = models.IntegerField(default=-1)  # 平均噪音值
    sleep_status = models.CharField(max_length=50)  # 睡眠状态
    note = models.TextField(blank=True, null=True)  # 备注（允许为空）
    created_at = models.DateTimeField(auto_now_add=True)  # 记录创建时间

    def __str__(self):
        return f"{self.user.phone_number} - {self.date} - {self.sleep_status}"
