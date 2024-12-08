import os

# 加载通用配置
from .settings_common import *

# 获取环境变量
ENVIRONMENT = os.getenv('DJANGO_ENV', 'development')

if ENVIRONMENT == 'production':
    from .settings_prod import *
else:
    from .settings_dev import *
    from dotenv import load_dotenv
    load_dotenv()

print("Database Name:", os.getenv('POSTGRES_DB'))
print("SMS Sign Name:", os.getenv('ALIYUN_SMS_SIGN_NAME'))
print("Test Phone Number:", os.getenv('SMS_TEST_PHONE_NUMBER'))