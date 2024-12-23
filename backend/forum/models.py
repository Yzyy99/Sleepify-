from django.db import models
from django.apps import apps
from forum.utils import get_embeddings
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
    embedding = models.JSONField(null=True, blank=True)  # 存储嵌入向量

    def save(self, *args, **kwargs):
        # 动态获取 AppConfig 中的 embedding_model
        # embedding_model = apps.get_app_config('forum').embedding_model
        # if not embedding_model:
        #     print("Embedding model is not initialized")
        # else:
        #     print("Embedding model is initialized")
        if self.content:  # 确保内容不为空
            self.embedding = get_embeddings(self.content)
            # self.embedding = embedding_model.encode(self.content).tolist()  # 生成嵌入并存储为列表
        super().save(*args, **kwargs)  # 调用父类的保存方法


class ForumPicture(models.Model):
    url = models.ImageField(upload_to='forum_pictures/')
    
