from django.urls import path
from . import views

urlpatterns = [
    path('posts/', views.get_forum_posts, name='get_forum_posts'),
    path('post_pictures/', views.get_forum_picture, name='get_forum_picture'),
    path('create_post/', views.create_forum_post, name='create_forum_post'),
    path('create_picture/', views.create_forum_picture, name='create_forum_picture'),
]
