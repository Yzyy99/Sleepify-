# app/urls.py
from django.urls import path
from .views import LoginAPIView, SendVerificationCodeView, VerifyCodeView, LogoutAPIView, RegisterAPIView, SendVerificationCodeWithoutCheckView
from .views import VerifyCodeAndUpdatePhoneView, SleepRecordAPIView, SleepAnalysisAPIView

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
    path('send_verification_code/', SendVerificationCodeView.as_view(), name='send_verification_code'),
    path('verify-code/', VerifyCodeView.as_view(), name='verify_code'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('register/', RegisterAPIView.as_view(), name='register'),  
    path('send_verification_code_without_check/', SendVerificationCodeWithoutCheckView.as_view(), name='send_verification_code_without_check'),
    path('verify-code-and-update-phone/', VerifyCodeAndUpdatePhoneView.as_view(), name='verify_code_and_update_phone'),
    path('sleep-records/', SleepRecordAPIView.as_view(), name='sleep_records'), 
    path('sleep-analysis/', SleepAnalysisAPIView.as_view(), name='sleep_analysis'),
]
