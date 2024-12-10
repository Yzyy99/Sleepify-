from django.test import TestCase
from forum.models import ForumPost
from sentence_transformers import SentenceTransformer

class ForumPostTestCase(TestCase):
    def setUp(self):
        # 在测试开始前初始化全局变量 embedding_model
        global embedding_model
        embedding_model = SentenceTransformer('aspire/acge_text_embedding', cache_folder=r'/app/models/sentence_transformers')
    
    def test_embedding_generation(self):
        # 创建帖子
        post = ForumPost(
            username="test_user",
            content="这是一个测试帖子",
            picture_count=0,
            picture_names=[]
        )
        post.save()  # 调用 save 方法，触发嵌入向量计算

        # 检查 embedding 是否生成
        self.assertIsNotNone(post.embedding, "Embedding should not be None")
        self.assertIsInstance(post.embedding, list, "Embedding should be a list")
        self.assertGreater(len(post.embedding), 0, "Embedding list should not be empty")
        print(post.embedding)  # 输出帖子嵌入向量
