import os

# 加载通用配置
from .settings_common import *

# 获取环境变量
ENVIRONMENT = os.getenv('DJANGO_ENV', 'development')

from dotenv import load_dotenv
load_dotenv()

if ENVIRONMENT == 'production':
    from .settings_prod import *
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': 'redis://redis:6379/1',
            'OPTIONS': {
                'PASSWORD': os.getenv('REDIS_PASSWORD'),
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            }
        }
    }
else:
    from .settings_dev import *

    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': 'redis://127.0.0.1:6379/1',
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            }
        }
    }
    print("Database Name:", os.getenv('POSTGRES_DB'))
    print("SMS Sign Name:", os.getenv('ALIYUN_SMS_SIGN_NAME'))
    print("Test Phone Number:", os.getenv('SMS_TEST_PHONE_NUMBER'))

