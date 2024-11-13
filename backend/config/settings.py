import os

# 加载通用配置
from .settings_common import *

# 获取环境变量
ENVIRONMENT = os.getenv('DJANGO_ENV', 'development')

if ENVIRONMENT == 'production':
    from .settings_prod import *
else:
    from .settings_dev import *
