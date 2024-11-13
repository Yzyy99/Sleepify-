import unittest

from django.test import Client, TestCase
from django.urls import reverse

from app.models import CustomUser
class APITestCase(TestCase):
    def setUp(self):
        user = CustomUser.objects.create_user(phone_number='testcase')
        user.set_password('password')
        user.save()
        self.client = Client()

    def test_login(self):
        """
        使用错误的信息进行登录，检查返回值为失败
        """
        response1 = self.client.post(reverse('login'),
                                      data={'username': 'testcase',
                                            'password': str('nopassword')},
                                      content_type='application/json')
        self.assertEqual(response1.status_code, 401)
        """
        使用正确的信息进行登录，检查返回值为成功
        """
        response2 = self.client.post(reverse('login'),
                                     data={'username': 'testcase',
                                           'password': str('password')},
                                     content_type='application/json')
        self.assertEqual(response2.status_code, 200)
        """
        使用错误的方法进行登录，检查返回值为失败
        """
        response3 = self.client.get(reverse('login'),
                                     data={'username': 'testcase',
                                           'password': str('password')},
                                     content_type='application/json')
        self.assertEqual(response3.status_code, 405)

if __name__ == '__main__':
    unittest.main()