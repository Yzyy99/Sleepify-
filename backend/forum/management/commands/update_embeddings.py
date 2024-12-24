from django.core.management.base import BaseCommand
from forum.models import ForumPost
from forum.utils import get_embeddings
import os

# 加载嵌入模型
# if os.environ.get('DISABLE_MODEL_LOADING') != 'true':
#     model = SentenceTransformer('aspire/acge_text_embedding', cache_folder=r'/app/models/sentence_transformers')

class Command(BaseCommand):
    help = "为数据库中没有嵌入向量的帖子生成并保存嵌入"

    def handle(self, *args, **kwargs):
        if os.environ.get('DISABLE_MODEL_LOADING') == 'true':
            self.stdout.write(self.style.WARNING("Model loading is disabled."))
            return
        # 查询所有没有嵌入向量的帖子
        posts_without_embedding = ForumPost.objects.filter(embedding__isnull=True)

        if not posts_without_embedding.exists():
            self.stdout.write(self.style.SUCCESS("所有帖子都已经有嵌入向量，无需更新。"))
            return

        # 遍历并生成嵌入向量
        for post in posts_without_embedding:
            self.stdout.write(f"正在为帖子 ID {post.postid} 生成嵌入向量...")
            try:
                # 生成嵌入向量
                # embedding = model.encode(post.content, normalize_embeddings=True).tolist()
                embedding = get_embeddings(post.content)
                # 保存到数据库
                post.embedding = embedding
                post.save()
                self.stdout.write(self.style.SUCCESS(f"帖子 ID {post.postid} 的嵌入向量已保存。"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"帖子 ID {post.postid} 的嵌入向量生成失败：{str(e)}"))

        self.stdout.write(self.style.SUCCESS("所有缺少嵌入向量的帖子已处理完毕。"))
