# music/urls.py
from django.urls import path

from music import views

urlpatterns = [
    path('music/', views.MusicView.as_view(), name='music'),
    path('musiclist/', views.MusicListView.as_view(), name='musiclist'),
]
