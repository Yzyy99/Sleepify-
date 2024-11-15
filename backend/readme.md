# How to run dev server?

## Run Server

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