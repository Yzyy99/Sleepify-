import unittest

from django.test import TestCase, Client
from forum.models import ForumPost, ForumPicture
from sentence_transformers import SentenceTransformer
from django.contrib.auth import get_user_model
import base64
import json
import os

User = get_user_model()

class ForumPostTestCase(TestCase):
    def setUp(self):
        # 在测试开始前初始化全局变量 embedding_model
        import os
        if os.environ.get('DISABLE_MODEL_LOADING') == 'true':
            print("Model loading is disabled.")
            return
        global embedding_model
        embedding_model = SentenceTransformer('aspire/acge_text_embedding', cache_folder=r'/app/models/sentence_transformers')
        
        # 创建测试用户
        self.user = User.objects.create_user(
            phone_number='13800138000',
            password='testpass123'
        )
        
        # 创建测试客户端
        self.client = Client()
        
        # 登录用户
        self.client.login(phone_number='13800138000', password='testpass123')
        
        # 创建测试帖子
        self.test_post = ForumPost.objects.create(
            username='13800138000',
            content='测试帖子内容',
            picture_count=0,
            picture_names=[]
        )
    
    def test_embedding_generation(self):
        import os
        if os.environ.get('DISABLE_MODEL_LOADING') == 'true':
            print("Model loading is disabled.")
            return
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

    def test_create_forum_post(self):
        """测试创建帖子"""
        post_data = {
            'content': '新测试帖子',
            'picture_count': 0,
            'picture_names': json.dumps([])
        }
        
        response = self.client.post(
            '/api/forum/create-post/',
            data=post_data,
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        self.assertTrue(ForumPost.objects.filter(content='新测试帖子').exists())

    def test_get_forum_posts(self):
        """测试获取帖子列表"""
        response = self.client.post('/api/forum/get-posts/')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIsInstance(data, list)
        self.assertTrue(len(data) > 0)

    def test_like_forum_post(self):
        """测试点赞功能"""
        response = self.client.post(
            '/api/forum/like-post/',
            data={'postid': self.test_post.postid},
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        updated_post = ForumPost.objects.get(postid=self.test_post.postid)
        self.assertEqual(updated_post.likes, 1)
        self.assertIn('13800138000', updated_post.like_user)

    def test_reply_forum_post(self):
        """测试回复功能"""
        response = self.client.post(
            '/api/forum/reply-post/',
            data={
                'postid': self.test_post.postid,
                'reply_content': '这是一条测试回复'
            },
            content_type='application/json',
            HTTP_AUTHORIZATION='Bearer testtoken'
        )
        
        self.assertEqual(response.status_code, 200)
        updated_post = ForumPost.objects.get(postid=self.test_post.postid)
        self.assertEqual(updated_post.replies, 1)
        self.assertEqual(len(updated_post.reply_content), 1)
        self.assertEqual(updated_post.reply_content[0]['content'], '这是一条测试回复')

    def test_delete_forum_post(self):
        """测试删除帖子"""
        response = self.client.post(
            '/api/forum/delete-post/',
            data={'postid': self.test_post.postid},
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertFalse(ForumPost.objects.filter(postid=self.test_post.postid).exists())

    def test_create_forum_picture(self):
        """测试上传图片"""
        # 创建一个简单的测试图片
        test_image = base64.b64encode(b'fake image data').decode('utf-8')
        
        response = self.client.post(
            '/api/forum/create-picture/',
            data={
                'image_type': 'png',
                'image_data': test_image
            },
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        self.assertIn('filename', response.json())

    def test_unauthorized_access(self):
        """测试未授权访问"""
        # 创建新的未登录客户端
        client = Client()
        
        response = client.post('/api/forum/get-posts/')
        self.assertEqual(response.status_code, 401)

    def test_invalid_post_data(self):
        """测试无效的帖子数据"""
        response = self.client.post(
            '/api/forum/create-post/',
            data={},
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)

    def test_multiple_likes(self):
        """测试多次点赞同一帖子"""
        # 第一次点赞
        response1 = self.client.post(
            '/api/forum/like-post/',
            data={'postid': self.test_post.postid},
            content_type='application/json'
        )
        
        # 第二次点赞（应该取消点赞）
        response2 = self.client.post(
            '/api/forum/like-post/',
            data={'postid': self.test_post.postid},
            content_type='application/json'
        )
        
        updated_post = ForumPost.objects.get(postid=self.test_post.postid)
        self.assertEqual(updated_post.likes, 0)
        self.assertNotIn('13800138000', updated_post.like_user)

    def tearDown(self):
        """清理测试数据"""
        User.objects.all().delete()
        ForumPost.objects.all().delete()

if __name__ == '__main__':
    unittest.main()