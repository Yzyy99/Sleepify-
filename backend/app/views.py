import datetime

import jwt
from django.conf import settings
from django.contrib.auth.models import User
from django.core.cache import cache
from django.shortcuts import render
import random
from django.utils import timezone
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

# Create your views here.
# api/views.py
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from django.contrib.auth import authenticate

from app.models import VerificationCode, CustomUser, SleepRecord
from rest_framework import serializers
from utils.aliyunSMS import SMSClient

from openai import OpenAI
from datetime import timedelta
from django.utils.timezone import now
from .models import SleepRecord

client = OpenAI(
    base_url='https://xiaoai.plus/v1',
    api_key='sk-5niABBgIca92aTfWgTyLT9kpznt4NIqcZdpJyE0JgHU3rvSm'
)

class RegisterAPIView(APIView):
    def post(self, request, *args, **kwargs):
        # 获取前端传递的手机号和密码
        phone_number = request.data.get('username')  # 前端字段是 username
        password = request.data.get('password')

        # 验证输入是否合法
        if not phone_number or not password:
            return Response({'error': 'Phone number and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # 检查手机号是否已注册
        if CustomUser.objects.filter(phone_number=phone_number).exists():
            return Response({'error': 'Phone number is already registered.'}, status=status.HTTP_400_BAD_REQUEST)

        # 创建用户
        user = CustomUser.objects.create_user(phone_number=phone_number, password=password)

        # 注册成功，返回成功信息
        return Response({'message': 'Registration successful.'}, status=status.HTTP_201_CREATED)

class LoginAPIView(APIView):
    def post(self, request, *args, **kwargs):
        phone_number = request.data.get('username')
        password = request.data.get('password')
        print(f'{phone_number} {password}')

        # user = authenticate(request, phone_number=phone_number, password=password)
        # 检查用户是否存在
        try:
            user = CustomUser.objects.get(phone_number=phone_number)
            print(f"User found: {user}")
        except CustomUser.DoesNotExist:
            return Response({'error': 'User does not exist'}, status=status.HTTP_401_UNAUTHORIZED)

        # 手动验证密码
        if not user.check_password(password):
            return Response({'error': 'Invalid password'}, status=status.HTTP_401_UNAUTHORIZED)
        if user is not None:
            # 登录成功，生成 token
            refresh = RefreshToken.for_user(user)
            refresh.set_exp(lifetime=datetime.timedelta(days=7)) 
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid phone number or password'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutAPIView(APIView):
    def post(self, request, *args, **kwargs):
        token = request.data.get('refresh')
        if not token:
            return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(token)
            return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_401_UNAUTHORIZED)

class SendVerificationCodeView(APIView):
    def post(self, request):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response({'error': 'Phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # 检查是否已有该电话号码的用户
        if CustomUser.objects.filter(phone_number=phone_number).exists():
            return Response({'error': 'User with this phone number already exists.'},
                            status=status.HTTP_409_CONFLICT)

        # 检查 60 秒内是否已经发送过验证码
        cached_code = cache.get(f'verify_code_{phone_number}_time')
        if cached_code:
            return Response({'error': 'Please wait before requesting another code.'},
                                status=status.HTTP_429_TOO_MANY_REQUESTS)

        # 生成验证码并发送短信
        code = f'{random.randint(100000, 999999)}'
        try:
            SMSClient.main(phone_number, code)
        except Exception as e:
            return Response({'error': 'Invalid phone number.'},
                            status=status.HTTP_400_BAD_REQUEST)
        # 缓存验证码和发送时间，10分钟有效
        cache.set(f'verify_code_{phone_number}', code, timeout=600)  # 验证码有效期10分钟
        cache.set(f'verify_code_{phone_number}_time', True, timeout=60)  # 防止60秒内重复发送

        # 创建一个临时令牌（Token），关联电话号码
        temp_token = jwt.encode(
            {'phone_number': phone_number, 'exp': datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(minutes=10)},
            settings.SECRET_KEY, algorithm='HS256'
        )

        return Response({'message': 'Verification code sent successfully.', 'token': temp_token},
                        status=status.HTTP_200_OK)


class VerifyCodeSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        token = data.get('token')
        code = data.get('code')
        password = data.get('password')

        # 解码 token 以获取 phone_number
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            phone_number = payload.get('phone_number')
        except jwt.ExpiredSignatureError:
            raise serializers.ValidationError('The token has expired.')
        except jwt.InvalidTokenError:
            raise serializers.ValidationError('Invalid token.')

        # 验证缓存的验证码
        cached_code = cache.get(f'verify_code_{phone_number}')
        if not cached_code or cached_code != code:
            raise serializers.ValidationError('Invalid or expired verification code.')

        # 删除已使用的验证码
        cache.delete(f'verify_code_{phone_number}')

        # 检查或创建用户
        if not CustomUser.objects.filter(phone_number=phone_number).exists():
            user = CustomUser.objects.create_user(phone_number=phone_number, password=password)
            print(f'User created: {user}, password: {password}')
            user.is_active = True
            user.save()
        else:
            user = CustomUser.objects.get(phone_number=phone_number)
            user.set_password(password)
            user.save()

        data['user'] = user
        return data


class VerifyCodeView(APIView):
    def post(self, request):
        print(request.data.get('password'))  # 确认后端接收到的密码
        serializer = VerifyCodeSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)


        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SendVerificationCodeWithoutCheckView(APIView):
    def post(self, request):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response({'error': 'Phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # 检查 60 秒内是否已经发送过验证码
        cached_code = cache.get(f'verify_code_{phone_number}_time')
        if cached_code:
            return Response({'error': 'Please wait before requesting another code.'},
                                status=status.HTTP_429_TOO_MANY_REQUESTS)

        # 生成验证码并发送短信
        code = f'{random.randint(100000, 999999)}'
        try:
            SMSClient.main(phone_number, code)
        except Exception as e:
            return Response({'error': 'Invalid phone number.'},
                            status=status.HTTP_400_BAD_REQUEST)
        # 缓存验证码和发送时间，10分钟有效
        cache.set(f'verify_code_{phone_number}', code, timeout=600)  # 验证码有效期10分钟
        cache.set(f'verify_code_{phone_number}_time', True, timeout=60)  # 防止60秒内重复发送

        # 创建一个临时令牌（Token），关联电话号码
        temp_token = jwt.encode(
            {'phone_number': phone_number, 'exp': datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(minutes=10)},
            settings.SECRET_KEY, algorithm='HS256'
        )

        return Response({'message': 'Verification code sent successfully.', 'token': temp_token},
                        status=status.HTTP_200_OK)

class VerifyCodeAndUpdatePhoneView(APIView):
    def post(self, request):
        code = request.data.get('code')
        old_phone_number = request.data.get('old_phone_number')  # 直接从请求中获取旧手机号
        new_phone_number = request.data.get('phone_number')

        print(f'{old_phone_number} {new_phone_number}')

        if not code or not old_phone_number or not new_phone_number:
            return Response({'error': 'code, old phone number, and new phone number are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # 验证缓存的验证码
        cached_code = cache.get(f'verify_code_{old_phone_number}')
        if not cached_code or cached_code != code:
            return Response({'error': 'Invalid or expired verification code.'}, status=status.HTTP_400_BAD_REQUEST)

        # 检查新手机号是否已被使用
        if CustomUser.objects.filter(phone_number=new_phone_number).exists():
            return Response({'error': 'The new phone number is already in use.'}, status=status.HTTP_409_CONFLICT)

        # 更新用户的手机号
        try:
            user = CustomUser.objects.get(phone_number=old_phone_number)
            user.phone_number = new_phone_number
            user.save()
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # 删除已使用的验证码
        cache.delete(f'verify_code_{old_phone_number}')

        return Response({'message': 'Phone number updated successfully.'}, status=status.HTTP_200_OK)
    
class SleepRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = SleepRecord
        fields = ['id', 'date', 'sleep_status', 'note', 'created_at']
        read_only_fields = ['id', 'created_at']  # 只读字段，前端无需提供

class SleepRecordAPIView(APIView):
    permission_classes = [IsAuthenticated]  # 只有登录用户才能访问

    def get(self, request):
        """获取当前用户的睡眠记录"""
        user = request.user
        records = SleepRecord.objects.filter(user=user).order_by('-date')  # 获取当前用户的记录
        serializer = SleepRecordSerializer(records, many=True)  # 序列化数据
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """存储前端传递的睡眠记录"""
        user = request.user  # 当前登录用户
        data = request.data  # 前端传递的数据
        #data['user'] = user.id  # 将当前用户的 ID 添加到数据中
        print("Received data:", data)

        serializer = SleepRecordSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=user)  # 保存记录，并关联到当前用户
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print("Serializer errors:", serializer.errors)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class SleepAnalysisAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """生成睡眠报告"""
        user = request.user

        # 从前端获取睡眠时间
        sleep_time = request.data.get("sleep_time", None)

        # 如果前端没有传递睡眠时间，返回错误提示
        if not sleep_time:
            return Response({"error": "请提供睡眠时间"}, status=status.HTTP_400_BAD_REQUEST)

        # 获取最近的一条睡眠记录
        recent_record = SleepRecord.objects.filter(user=user).order_by('-date').first()

        if not recent_record:
            return Response({"error": "没有找到睡眠记录"}, status=status.HTTP_404_NOT_FOUND)

        sleep_note = recent_record.note
        #sleep_note = "熬夜"

        try:
            # 调用 GPT 模型生成报告
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "你是一个睡眠助手，可以分析用户的睡眠情况和睡眠日志生成个性化的专属定制睡眠报告，需要用和蔼可亲的语言，切忌格式化。"},
                    {"role": "user", "content": f"睡眠时间：{sleep_time}小时。睡眠小记：{sleep_note}"}
                ]
            )
            report = response.choices[0].message.content 
            return Response({"report": report}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)