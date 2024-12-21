from django.db import models

# Create your models here.

class Music(models.Model):
    name = models.CharField(max_length=100)
    duration = models.IntegerField(default=0)