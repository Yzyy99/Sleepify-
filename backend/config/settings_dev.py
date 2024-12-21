from .settings_common import *

DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# 开发环境的静态文件配置
STATIC_URL = '/static/'
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'testserver']