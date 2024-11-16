import os
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

    def test_sendSMS(self):
        response1 = self.client.post(reverse('send_verification_code'),
                                     data={'phone_number': os.getenv('SMS_TEST_PHONE_NUMBER')},
                                     content_type='application/json')
        self.assertIn(response1.status_code, [200, 429])

        response2 = self.client.post(reverse('send_verification_code'),
                                     data={'phone_number': 'testcase'},
                                     content_type='application/json')
        self.assertEqual(response2.status_code, 400)

        response3 = self.client.post(reverse('send_verification_code'),
                                     content_type='application/json')
        self.assertEqual(response3.status_code, 400)

    def test_verifySMS(self):
        response1 = self.client.post(reverse('verify_code'),
                                     content_type='application/json')
        self.assertEqual(response1.status_code, 400)

    def test_logout(self):
        response1 = self.client.post(reverse('login'),
                                     data={'username': 'testcase',
                                           'password': str('password')},
                                     content_type='application/json')
        refresh = response1.json().get('refresh')
        response2 = self.client.post(reverse('logout'),
                                     data={'refresh': refresh},
                                     content_type='application/json')
        self.assertEqual(response2.status_code, 200)
        response3 = self.client.post(reverse('logout'),
                                     data={'refresh': refresh+'1'},
                                     content_type='application/json')
        self.assertEqual(response3.status_code, 401)
        response4 = self.client.post(reverse('logout'),
                                     content_type='application/json')
        self.assertEqual(response4.status_code, 400)

if __name__ == '__main__':
    unittest.main()