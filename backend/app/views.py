from django.shortcuts import render

# Create your views here.
# api/views.py
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate

class LoginAPIView(APIView):
    def post(self, request, *args, **kwargs):
        phone_number = request.data.get("username")
        password = request.data.get("password")
        print(f"{phone_number} {password}")

        user = authenticate(request, phone_number=phone_number, password=password)
        if user is not None:
            # 登录成功，生成 token
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid phone number or password"}, status=status.HTTP_401_UNAUTHORIZED)