from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Music

# 注册 Music 模型
@admin.register(Music)
class MusicAdmin(admin.ModelAdmin):
    list_display = ['name']  # 在后台列表中显示音乐名称