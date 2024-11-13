from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
class CustomUser(AbstractUser):
    username = None  # 移除默认用户名字段
    phone_number = models.CharField(max_length=15, unique=True)  # 手机号字段，唯一

    USERNAME_FIELD = 'phone_number'  # 登录时以手机号作为唯一标识
    REQUIRED_FIELDS = []  # 其他必填字段为空

    def __str__(self):
        return self.phone_number

