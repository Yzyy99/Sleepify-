# 使用官方 Python 镜像
FROM python:3.10

# 设置工作目录
WORKDIR /app

# 复制 requirements.txt 并安装依赖项
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目文件
COPY . .

# 设置环境变量
ENV PYTHONUNBUFFERED=1

# 运行静态文件收集命令
RUN python manage.py collectstatic --noinput

# 运行数据库迁移命令
RUN python manage.py migrate

# 启动命令，使用 Gunicorn 作为 WSGI 服务器
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
