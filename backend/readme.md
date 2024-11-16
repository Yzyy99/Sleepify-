# How to run dev server?

## Run Server

first, you should **RUN redis-server**:

### For Windows

 [Releases · microsoftarchive/redis](https://github.com/microsoftarchive/redis/releases), choose `Redis-{arch}-{version}.msi`, install, choose `Add the Redis installation folder to the PATH environment variable.`, make sure `Port to run Redis on:` `6379`.

To check redis, you can use

```bash
redis-cli ping
```

if output is PONG, redis server is running

else

```bash
redis-server
```

### For Linux (exam. Arch Linux)

```bash
sudo pacman -S redis
sudo vim /etc/redis.conf
>>> bind 127.0.0.1
>>> port 6379
(:wq)
sudo systemctl start redis
sudo systemctl enable redis (if you want it to start with the system)
sudo systemctl status redis (to check if it is running)
```



```bash
python manage.py makemigrations app
python manage.py migrate
python manage.py runserver
```

## Fill Some User

```bash
python manage.py shell
```

```python
from app.models import CustomUser   #CustomUser is a class
user = CustomUser(phone_number='<phone_number>')
user.set_password('<password>')
user.save()
exit()
```

## Test API

RUN

```bash
python tests/test_api.py
```

Curl

```bash
curl -X <Method> http://localhost:8000/<api>/ -H "application/json" -d "<data>"
```

If you are windows, PLEASE USE CMD, instead of Powershell, which uses Invoke-Webrequest, not curl.