from django.db import models

# Create your models here.


class ForumPost(models.Model):
    postid = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    picture_count = models.IntegerField(default=0)
    picture_names = models.JSONField(default=list)
    likes = models.IntegerField(default=0)
    like_user = models.JSONField(default=list)
    replies  = models.IntegerField(default=0)
    reply_content = models.JSONField(default=list)
    
class ForumPicture(models.Model):
    url = models.ImageField(upload_to='forum_pictures/')
    
