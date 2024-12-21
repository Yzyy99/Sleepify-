import unittest
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from app.tests import APITestCase
from forum.tests import ForumPostTestCase
from music.tests import MusicTestCase

if __name__ == '__main__':
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    suite.addTests(loader.loadTestsFromTestCase(ForumPostTestCase))
    suite.addTests(loader.loadTestsFromTestCase(APITestCase))
    suite.addTests(loader.loadTestsFromTestCase(MusicTestCase))

    runner = unittest.TextTestRunner()
    runner.run(suite)