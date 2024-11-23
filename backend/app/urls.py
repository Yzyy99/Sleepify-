# app/urls.py
from django.urls import path
from .views import LoginAPIView, SendVerificationCodeView, VerifyCodeView, LogoutAPIView, RegisterAPIView

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
    path('send_verification_code/', SendVerificationCodeView.as_view(), name='send_verification_code'),
    path('verify-code/', VerifyCodeView.as_view(), name='verify_code'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('register/', RegisterAPIView.as_view(), name='register'),  
]
