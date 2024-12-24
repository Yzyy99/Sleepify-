import unittest

from django.test import TestCase, Client
from fontTools.misc.filenames import userNameToFileName

from app.models import CustomUser, SleepRecord
from forum.models import ForumPost, ForumPicture
from django.urls import reverse
# from sentence_transformers import SentenceTransformer
from django.contrib.auth import get_user_model
import base64
import json
import os

User = get_user_model()

class ForumPostTestCase(TestCase):
    def setUp(self):

        user = CustomUser.objects.create_user(phone_number='13800138000', username='case')
        user.set_password('password')
        user.save()
        self.user = user

        # 创建测试客户端
        self.client = Client()
        # 在测试开始前初始化全局变量 embedding_model
        import os
        if os.environ.get('DISABLE_MODEL_LOADING') == 'true':
            print("Model loading is disabled.")
            return
        # global embedding_model
        # embedding_model = SentenceTransformer('aspire/acge_text_embedding', cache_folder=r'/app/models/sentence_transformers')
        
        # # 登录用户
        # self.client.login(phone_number='13800138000', password='testpass123')
        
        # 创建测试帖子
        self.test_post = ForumPost.objects.create(
            username='13800138000',
            content='测试帖子内容',
            picture_count=0,
            picture_names=[]
        )

    def login(self):
        response = self.client.post(reverse('login'),
                                    data={'phone_number': '13800138000',
                                          'password': str('password')},
                                    content_type='application/json')
        self.access_token = response.json().get('access')

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

    def test_create_forum_post(self):
        """测试创建帖子"""
        post_data = {
            'content': '新测试帖子',
            'picture_count': 0,
            'picture_names': json.dumps([])
        }
        self.login()
        response = self.client.post(
            reverse('create_forum_post'),
            data=post_data,
            content_type='application/json',
            headers= {'Authorization': 'Bearer ' + self.access_token}
        )
        
        self.assertEqual(response.status_code, 201)
        self.assertTrue(ForumPost.objects.filter(content='新测试帖子').exists())

    def test_get_forum_posts(self):
        """测试获取帖子列表"""
        self.login()
        response = self.client.post(reverse('get_forum_posts'),
                                    headers={'Authorization': 'Bearer ' + self.access_token})
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIsInstance(data, list)
        self.assertTrue(len(data) > 0)

    def test_like_forum_post(self):
        """测试点赞功能"""
        self.login()
        response = self.client.post(
            reverse('like_forum_post'),
            data={'postid': self.test_post.postid},
            content_type='application/json',
            headers= {'Authorization': 'Bearer ' + self.access_token}
        )
        
        self.assertEqual(response.status_code, 200)
        updated_post = ForumPost.objects.get(postid=self.test_post.postid)
        self.assertEqual(updated_post.likes, 1)
        self.assertIn('13800138000', updated_post.like_user)

    def test_reply_forum_post(self):
        """测试回复功能"""
        self.login()
        response = self.client.post(
            reverse('reply_forum_post'),
            data={
                'postid': self.test_post.postid,
                'reply_content': '这是一条测试回复'
            },
            content_type='application/json',
            headers= {'Authorization': 'Bearer ' + self.access_token}
        )
        
        self.assertEqual(response.status_code, 200)
        updated_post = ForumPost.objects.get(postid=self.test_post.postid)
        self.assertEqual(updated_post.replies, 1)
        self.assertEqual(len(updated_post.reply_content), 1)
        self.assertEqual(updated_post.reply_content[0]['content'], '这是一条测试回复')

    def test_delete_forum_post(self):
        """测试删除帖子"""
        self.login()
        response = self.client.post(
            reverse('delete_forum_post'),
            data={'postid': self.test_post.postid},
            content_type='application/json',
            headers= {'Authorization': 'Bearer ' + self.access_token}
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertFalse(ForumPost.objects.filter(postid=self.test_post.postid).exists())

    def test_forum_picture(self):
        """测试图片"""
        # 创建一个简单的测试图片
        test_image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAEAAAAAAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAEAAUDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8K6KKK8s/QD//2Q=='
        self.login()
        response = self.client.post(
            reverse('create_forum_picture'),
            data={
                'image_type': 'jpg',
                'image_data': test_image
            },
            content_type='application/json',
            headers={'Authorization': 'Bearer ' + self.access_token}
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('filename', response.json())
        name = response.json()['filename']

        response = self.client.post(
            reverse('get_forum_picture'),
            data={'picture_name': name},
            content_type='application/json',
            headers={'Authorization': 'Bearer ' + self.access_token}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('image', response.json())


    def test_unauthorized_access(self):
        """测试未授权访问"""
        
        response = self.client.post(reverse('get_forum_posts'))
        self.assertEqual(response.status_code, 401)
        response = self.client.post(reverse('get_forum_picture'))
        self.assertEqual(response.status_code, 401)
        response = self.client.post(reverse('create_forum_post'))
        self.assertEqual(response.status_code, 401)
        response = self.client.post(reverse('create_forum_picture'))
        self.assertEqual(response.status_code, 401)
        response = self.client.post(reverse('like_forum_post'))
        self.assertEqual(response.status_code, 401)
        response = self.client.post(reverse('reply_forum_post'))
        self.assertEqual(response.status_code, 401)
        response = self.client.post(reverse('delete_forum_post'))
        self.assertEqual(response.status_code, 401)
        response = self.client.post(reverse('get_similarity_posts'))
        self.assertEqual(response.status_code, 401)

    def test_invalid_post_data(self):
        """测试无效的帖子数据"""
        self.login()
        response = self.client.post(
            '/api/forum/create_post/',
            data={},
            content_type='application/json',
            headers={'Authorization': 'Bearer ' + self.access_token}
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

    def test_similar_posts(self):
        self.login()
        post = ForumPost(
            username="test_user",
            content="这是一个测试帖子",
            picture_count=0,
            picture_names=[]
        )
        post.save()
        post = ForumPost(
            username="test_user",
            content="这是2个测试帖子",
            picture_count=0,
            picture_names=[]
        )
        post.save()
        postnum = ForumPost.objects.all().count()

        response = self.client.post(
            '/api/forum/similarity_posts/',
            content_type='application/json',
            data={'last_post_id': postnum},
        headers={'Authorization': 'Bearer ' + self.access_token},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), postnum - 1)
        SleepRecord.objects.create(user=self.user,sleep_status='not good',screen_on=0,
                                   noise_max=20,noise_avg=0)
        response = self.client.post(
            '/api/forum/similarity_posts/',
            content_type='application/json',
            data={'last_post_id': postnum},
        headers={'Authorization': 'Bearer ' + self.access_token},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), postnum - 1)
        pass

    def tearDown(self):
        """清理测试数据"""
        User.objects.all().delete()
        ForumPost.objects.all().delete()

if __name__ == '__main__':
    unittest.main()