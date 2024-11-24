from django.urls import path
from . import views

urlpatterns = [
    path('posts/', views.GetForumPosts.as_view(), name='get_forum_posts'),
    path('get_picture/', views.GetForumPicture.as_view(), name='get_forum_picture'),
    path('create_post/', views.CreateForumPost.as_view(), name='create_forum_post'),
    path('create_picture/', views.CreateForumPicture.as_view(), name='create_forum_picture'),
    path('like_post/', views.LikeForumPost.as_view(), name='like_forum_post'),
    path('reply_post/', views.ReplyForumPost.as_view(), name='reply_forum_post'),
]
