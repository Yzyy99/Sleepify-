from rest_framework import serializers
from app.models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'phone_number', 'username', 'avatar']
        read_only_fields = ['id', 'phone_number']
