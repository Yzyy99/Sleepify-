# app/urls.py
from django.urls import path
from .views import LoginAPIView, SendVerificationCodeView, VerifyCodeView, LogoutAPIView, RegisterAPIView, \
    SendVerificationCodeWithoutCheckView, UserProfileView
from .views import VerifyCodeAndUpdatePhoneView, SleepRecordAPIView, SleepAnalysisAPIView, SleepInformationAPIView

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
    path('sleep-data/', SleepInformationAPIView.as_view(), name='sleep_data'),
    path('user/', UserProfileView.as_view(), name='user_profile'),
]
