import os
from io import BytesIO

from aiohttp.web_fileresponse import content_type
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

# Create your tests here.

from django.test import Client, TestCase
from django.urls import reverse
from datetime import date

from app.models import CustomUser
from config import settings
from music.models import Music
from pydub.generators import Sine

class MusicTestCase(TestCase):
    def setUp(self):
        user = CustomUser.objects.create_user(phone_number='normal_case')
        user.set_password('password')
        user.save()
        self.normaluser = user

        superuser = CustomUser.objects.create_superuser(phone_number='super_case')
        superuser.set_password('password')
        superuser.save()
        self.superuser = superuser

        self.client = Client()
        mp3_data = b'ID3\x04\x00\x00\x00\x00\x00\x21\x00TIT2\x00\x00\x00\x15\x00\x00\x03Fake Title\x00TPE1\x00\x00\x00\x15\x00\x00\x03Fake Artist'

        sine_wave = Sine(440).to_audio_segment(duration=1000)
        audio_buffer = BytesIO()
        sine_wave.export(audio_buffer, format="mp3")
        audio_buffer.seek(0)

        audio_data = audio_buffer.read()[10:]

        final_mp3_data = mp3_data + audio_data

        mp3_file = SimpleUploadedFile('test.mp3', final_mp3_data, content_type='audio/mpeg')
        self.mp3file = mp3_file
        self.mp3data = final_mp3_data


    def login_for_test(self):
        response = self.client.post(reverse('login'),
                                    data={'phone_number': 'normal_case',
                                          'password': 'password'},
                                    content_type='application/json')
        self.naccess_token = response.json().get('access')
        self.assertEqual(response.status_code, 200)
        response = self.client.post(reverse('login'),
                                    data={'phone_number': 'super_case',
                                          'password': 'password'},
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.saccess_token = response.json().get('access')
        print(self.saccess_token)

    def test_music(self):
        response = self.client.get(reverse('music'))
        self.assertEqual(response.status_code, 401)
        self.login_for_test()
        response = self.client.get(reverse('music'),
                                   headers={'Authorization': 'Bearer ' + self.naccess_token})
        self.assertEqual(response.status_code, 400)
        response = self.client.post(reverse('music'),
                                   content_type='multipart/form-data',
                                   headers={'Authorization': 'Bearer ' + self.naccess_token})
        self.assertEqual(response.status_code, 401)
        response = self.client.post(reverse('music'),
                                   format='multipart',
                                   data={
                                       'file': self.mp3file,
                                       'name': 'test.mp3'
                                   },
                                   headers={'Authorization': 'Bearer ' + self.saccess_token})
        self.assertEqual(response.status_code, 200)

        response = self.client.get(reverse('music'),
                                   content_type='application/json',
                                   data={'name': 'test.mp3'},
                                   headers={'Authorization': 'Bearer ' + self.naccess_token})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get('Content-Type'), 'audio/mpeg')
        self.assertEqual(response.get('Content-Disposition'), 'inline; filename="test.mp3"')
        data = b''.join(list(response.streaming_content))
        self.assertEqual(data, self.mp3data)


        response = self.client.delete(reverse('music'),
                                   content_type='application/json',
                                   data={'name': 'test.mp3'},
                                   headers={'Authorization': 'Bearer ' + self.naccess_token})
        self.assertEqual(response.status_code, 401)

        response = self.client.delete(reverse('music'),
                                      content_type='application/json',
                                      data={'name': 'test.mp3'},
                                      headers={'Authorization': 'Bearer ' + self.saccess_token})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Music.objects.count(), 0)

    def test_music_list(self):
        response = self.client.get(reverse('musiclist'))
        self.assertEqual(response.status_code, 401)
        self.login_for_test()
        response = self.client.get(reverse('musiclist'),
                                   headers={'Authorization': 'Bearer ' + self.naccess_token})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get('music_list'), [])
        self.client.post(reverse('music'),
                                    format='multipart',
                                    data={
                                        'file': self.mp3file,
                                        'name': 'test.mp3'
                                    },
                                    headers={'Authorization': 'Bearer ' + self.saccess_token})
        self.assertEqual(response.status_code, 200)
        response = self.client.get(reverse('musiclist'),
                                   headers={'Authorization': 'Bearer ' + self.saccess_token})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json().get('music_list')), 1)
        self.assertEqual(len(response.json().get('music_list')[0]), 2)
        self.client.delete(reverse('music'),
                           headers={'Authorization': 'Bearer ' + self.naccess_token},
                           content_type='application/json',
                           data={'name': 'test.mp3'})
