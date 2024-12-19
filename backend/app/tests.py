from django.test import TestCase

# Create your tests here.
import os
import unittest

from django.test import Client, TestCase
from django.urls import reverse
from datetime import date

from app.models import CustomUser, SleepRecord


class APITestCase(TestCase):
    def setUp(self):
        user = CustomUser.objects.create_user(phone_number='testcase')
        user.set_password('password')
        user.save()
        self.user = user
        self.client = Client()

        self.sleep_record = SleepRecord.objects.create(
            user=self.user,
            date=date.today(),
            sleep_time="23:00",
            wake_time="07:00",
            screen_on=5,
            noise_max=60.5,
            noise_avg=45.2,
            sleep_status="良好",
            note="睡眠测试"
        )

    def login_for_test(self):
        """辅助方法：用于需要登录的测试"""
        response = self.client.post(reverse('login'),
                                    data={'username': 'testcase',
                                          'password': 'password'},
                                    content_type='application/json')
        self.access_token = response.json().get('access')

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
        """
        使用能注册的账号进行注册，可能是成功，请求过于频繁和用户已存在
        """
        response1 = self.client.post(reverse('send_verification_code'),
                                     data={'phone_number': os.getenv('SMS_TEST_PHONE_NUMBER')},
                                     content_type='application/json')
        self.assertIn(response1.status_code, [200, 409, 429])
        """
            使用已经存在的账户注册，请求失败
        """
        response2 = self.client.post(reverse('send_verification_code'),
                                     data={'phone_number': 'testcase'},
                                     content_type='application/json')
        self.assertEqual(response2.status_code, 409)
        """
            不带账号注册，检查返回值为失败
        """
        response3 = self.client.post(reverse('send_verification_code'),
                                     content_type='application/json')
        self.assertEqual(response3.status_code, 400)

    def test_verifySMS(self):
        """
            由于需要前一个模块随机生成的code作为参数，因此无法自动测试200样例
            没有参数进行验证，检查返回值为失败
        """
        response1 = self.client.post(reverse('verify_code'),
                                     content_type='application/json')
        self.assertEqual(response1.status_code, 400)

    def test_logout(self):
        response1 = self.client.post(reverse('login'),
                                     data={'username': 'testcase',
                                           'password': str('password')},
                                     content_type='application/json')
        refresh = response1.json().get('refresh')
        """
            使用正确的refresh_token退出，检查返回值为成功
        """
        response2 = self.client.post(reverse('logout'),
                                     headers={'Authorization': 'Bearer ' + refresh},
                                     content_type='application/json')
        self.assertEqual(response2.status_code, 200)
        """
            使用错误的refresh_token退出，检查返回值为失败
        """
        response3 = self.client.post(reverse('logout'),
                                     headers={'Authorization': 'Bearer ' + refresh + "1"},
                                     content_type='application/json')
        self.assertEqual(response3.status_code, 401)
        """
           不使用refresh_token退出，检查返回值为失败
        """
        response4 = self.client.post(reverse('logout'),
                                     content_type='application/json')
        self.assertEqual(response4.status_code, 401)

    def test_get_sleep_records(self):
        """测试获取睡眠记录"""
        # 测试未认证访问
        response = self.client.get(reverse('sleep_records'))
        self.assertEqual(response.status_code, 401)

        # 测试认证后访问
        self.login_for_test()
        response = self.client.get(reverse('sleep_records'),
                                   headers={'Authorization': 'Bearer ' + self.access_token})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.json()) > 0)

    def test_create_sleep_record(self):
        """测试创建睡眠记录"""
        self.login_for_test()

        # 测试创建完整记录
        data = {
            'date': '2024-01-01',
            'sleep_time': '23:00',
            'wake_time': '07:00',
            'screen_on': 3,
            'noise_max': 65.0,
            'noise_avg': 40.0,
            'sleep_status': '良好',
            'note': '测试睡眠'
        }
        response = self.client.post(reverse('sleep_records'),
                                    data=data,
                                    content_type='application/json',
                                    headers={'Authorization': 'Bearer ' + self.access_token})
        self.assertEqual(response.status_code, 201)

        # 测试创建部分记录（使用历史数据填充）
        partial_data = {
            'date': '2024-01-02',
            'sleep_status': '一般',
            'note': '部分测试'
        }
        response = self.client.post(reverse('sleep_records'),
                                    data=partial_data,
                                    content_type='application/json',
                                    headers={'Authorization': 'Bearer ' + self.access_token})
        self.assertEqual(response.status_code, 201)

        # 测试创建无效记录
        invalid_data = {
            'date': 'invalid-date'
        }
        response = self.client.post(reverse('sleep_records'),
                                    data=invalid_data,
                                    content_type='application/json',
                                    headers={'Authorization': 'Bearer ' + self.access_token})
        self.assertEqual(response.status_code, 400)

    def test_sleep_analysis(self):
        """测试睡眠分析功能"""
        # 测试未认证访问
        response = self.client.post(reverse('sleep_analysis'))
        self.assertEqual(response.status_code, 401)

        # 测试认证后访问
        self.login_for_test()
        response = self.client.post(reverse('sleep_analysis'),
                                    headers={'Authorization': 'Bearer ' + self.access_token})
        self.assertEqual(response.status_code, 200)
        self.assertIn('report', response.json())

        # 测试无睡眠记录的情况
        SleepRecord.objects.all().delete()
        response = self.client.post(reverse('sleep_analysis'),
                                    headers={'Authorization': 'Bearer ' + self.access_token})
        self.assertEqual(response.status_code, 404)

    def test_sleep_information(self):
        """测试获取睡眠信息"""
        # 测试未认证访问
        response = self.client.post(reverse('sleep_data'))
        self.assertEqual(response.status_code, 401)

        # 测试认证后访问
        self.login_for_test()
        response = self.client.post(reverse('sleep_data'),
                                    headers={'Authorization': 'Bearer ' + self.access_token})
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # 验证返回的数据字段
        expected_fields = [
            'date', 'sleep_time', 'wake_time', 'sleep_duration',
            'screen_on', 'noise_max', 'noise_avg', 'sleep_status', 'sleep_note'
        ]
        for field in expected_fields:
            self.assertIn(field, data)

        # 验证睡眠时长计算
        self.assertIsInstance(data['sleep_duration'], (int, float))

        # 测试无睡眠记录的情况
        SleepRecord.objects.all().delete()
        response = self.client.post(reverse('sleep_data'),
                                    headers={'Authorization': 'Bearer ' + self.access_token})
        self.assertEqual(response.status_code, 404)

    def test_delete_sleep_record(self):
        response1 = self.client.post(reverse('login'),
                                     content_type='application/json',
                                     data={'username': 'testcase',
                                           'password': str('password')}
                                     )
        token = response1.json().get('access')
        response2 = self.client.post(reverse('sleep_records'),
                                     content_type='application/json',
                                     headers={'Authorization': f'Bearer {token}'},
                                     data={'date': '2024-12-03',
                                           'sleep_status': '1',
                                           'note': 'good'})
        self.assertEqual(response2.status_code, 201)
        response3 = self.client.get(reverse('sleep_records'),
                                    content_type='application/json',
                                    headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response3.status_code, 200)
        id1 = response3.json()[0].get('id')
        id2 = response3.json()[1].get('id')
        response4 = self.client.delete(reverse('sleep_records'),
                                       content_type='application/json',
                                       headers={'Authorization': f'Bearer {token}'},
                                       data={'id': id1})
        self.assertEqual(response4.status_code, 200)
        res = self.client.delete(reverse('sleep_records'),
                           content_type='application/json',
                           headers={'Authorization': f'Bearer {token}'},
                           data={'id': id2})
        response5 = self.client.get(reverse('sleep_records'),
                                    content_type='application/json',
                                    headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response5.json(), [])
        response6 = self.client.delete(reverse('sleep_records'),
                                       content_type='application/json',
                                       headers={'Authorization': f'Bearer {token}'},
                                       data={'id': id1})
        self.assertEqual(response6.status_code, 404)


if __name__ == '__main__':
    unittest.main()