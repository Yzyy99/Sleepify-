import base64
import json
import numpy as np
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from .models import ForumPost, ForumPicture
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from app.models import SleepRecord

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers
import hashlib
import time
from sentence_transformers import SentenceTransformer
from forum.utils import batch_calculate_similarities
from threading import Lock
import os

'''
# 全局变量缓存模型
_embedding_model = None
_model_lock = Lock()

def get_embedding_model():
    """
    获取嵌入模型，使用延迟加载的方式，保证只加载一次
    """
    global _embedding_model
    if _embedding_model is None:
        with _model_lock:  # 加锁防止多线程同时加载模型
            if _embedding_model is None:  # 双重检查
                print("Loading embedding model...")
                _embedding_model = SentenceTransformer(
                    'aspire/acge_text_embedding', 
                    cache_folder=r'X:\course\software engineering\model'
                )
                print("Embedding model loaded successfully!")
    return _embedding_model
'''

if os.environ.get('DISABLE_MODEL_LOADING') != 'true':
    model = SentenceTransformer('aspire/acge_text_embedding', cache_folder=r'/app/models/sentence_transformers')

class ForumPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumPost
        fields = ['id', 'username', 'content', 'created_at']  

class GetForumPosts(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'User is not authenticated'}, status=401)
        
        last_post_id = request.data.get('last_post_id')
        limit = 1000

        if last_post_id:
            posts = ForumPost.objects.filter(id__lt=last_post_id).order_by('-created_at')[:limit]
        else:
            posts = ForumPost.objects.all().order_by('-created_at')[:limit]

        response_data = []
        for post in posts:
            response_data.append({
                'id': post.postid,
                'username': post.username,
                'content': post.content,
                'created_at': post.created_at,
                'picture_count': post.picture_count,
                'picture_names': post.picture_names,
                'likes': post.likes,
                'replies': post.replies,
                'reply_content': post.reply_content,
                'isliked': request.user.phone_number in post.like_user
            })

        return Response(response_data, status=200)


class GetForumPicture(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'User is not authenticated'}, status=401)
        picture_name = request.data.get('picture_name')
        if picture_name is None:
            return JsonResponse({'error': 'Picture not found'})
        try:
            # TODO : security issue
            with open(f'/app/staticfiles/media/forum_pictures/{picture_name}', 'rb') as f:
                encode_str = base64.b64encode(f.read()).decode('utf-8')
        except Exception as e:
            return Response({'error': str(e)}, status=500)
        return Response({'image': encode_str}, status=200)


class CreateForumPost(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'User is not authenticated'}, status=401)
        username = request.user.phone_number
        content = request.data.get('content')
        picture_count = request.data.get('picture_count')
        # check if it is a number
        try:
            picture_count = int(picture_count)
        except:
            return Response({'error': 'Invalid picture_count'}, status=400)
        # picture_names is a list of filenames, each is the response of the upload api
        picture_names = request.data.get('picture_names')
        if isinstance(picture_names, str):
            try:
                picture_names = json.loads(picture_names)
            except:
                return Response({'error': 'Invalid picture_names'}, status=400)
        # check if picture_names is a list with picture_count * string elements
        if not isinstance(picture_names, list) or len(picture_names) != picture_count \
            or not all(isinstance(i, str) for i in picture_names):
            return Response({'error': 'Invalid picture_names'}, status=400)
        if not content:
            return Response({'error': 'Content is required'}, status=400)
        if not picture_count:
            picture_count = 0
        # if not picture_names:
        #     picture_names = []
        # post = ForumPost.objects.create(username=username, content=content, picture_count=str(picture_count), picture_names=picture_names)
        post = ForumPost(
            username=username,
            content=content,
            picture_count=picture_count,
            picture_names=picture_names
        )
        post.save()  # 调用 save 方法，触发嵌入向量计算逻辑
        return Response({'postid': post.postid, 'created_at': post.created_at}, status=201)

class DeleteForumPost(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'User is not authenticated'}, status=401)
        postid = request.data.get('postid')
        if not postid:
            return Response({'error': 'Postid is required'}, status=400)
        post = get_object_or_404(ForumPost, postid=postid)
        if post is None:
            return Response({'error': 'Post not found'}, status=404)
        if post.username != request.user.phone_number:
            return Response({'error': 'You do not have permission to delete this post'}, status=403)
        post.delete()
        # TODO: process the pictures
        return Response({'message': 'Post deleted successfully'}, status=200)


class CreateForumPicture(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'User is not authenticated'}, status=401)
        
        image_type = request.data.get('image_type')
        if not image_type:
            return Response({'error': 'Image type is required'}, status=400)
        image_data = request.data.get('image_data')
        if not image_data:
            return Response({'error': 'Image data is required'}, status=400)
        # if it begins with 'data:image/xxx;base64,', remove it
        if image_data.startswith('data:image/'):
            image_data = image_data.split(',', 1)[1]
        try:
            image_bytes = base64.b64decode(image_data)
        except Exception as e:
            return Response({'error': 'Invalid base64 data'}, status=400)
        
        if len(image_bytes) > 5 * 1024 * 1024:
            return Response({'error': 'Image size exceeds 5MB'}, status=400)
        
        image_hash = hashlib.sha256(image_bytes).hexdigest()
        # time = yyyy-mm-ddThh:mm:ssZ
        timenow = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        filename = f'{image_hash}-{timenow}.{image_type}'
        image_path = f'/app/staticfiles/media/forum_pictures/{filename}'
        
        with open(image_path, 'wb') as f:
            f.write(image_bytes)
        
        picture = ForumPicture.objects.create(url=image_path)
        
        return Response({'filename': filename}, status=201)



class LikeForumPost(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'User is not authenticated'}, status=401)
        postid = request.data.get('postid')
        if not postid:
            return Response({'error': 'Postid is required'}, status=400)
        post = get_object_or_404(ForumPost, postid=postid)
        if post is None:
            return Response({'error': 'Post not found'}, status=404)
        if request.user.phone_number in post.like_user:
            post.likes -= 1
            post.like_user.remove(request.user.phone_number)
        else:
            post.likes += 1
            post.like_user.append(request.user.phone_number)
        post.save()
        return Response({'likes': post.likes, "isliked": request.user.phone_number in post.like_user}, status=200)


class ReplyForumPost(APIView):
    def post(self, request):
        access_token = request.headers.get('Authorization')
        if not access_token:
            return Response({'error': 'Access token is required'}, status=401)
        postid = request.data.get('postid')
        if not postid:
            return Response({'error': 'Postid is required'}, status=400)
        reply_content = request.data.get('reply_content')
        if not reply_content:
            return Response({'error': 'Reply content is required'}, status=400)
        post = get_object_or_404(ForumPost, postid=postid)
        if post is None:
            return Response({'error': 'Post not found'}, status=404)
        post.replies += 1
        post.reply_content.append({
            'reply_id': post.replies,
            'username': request.user.phone_number,
            'content': reply_content,
        })
        post.save()
        return Response({'replies': post.replies, "reply_content": post.reply_content}, status=200)
    
class GetForumPostsWithSimilairity(APIView):
    """
    获取并返回社区帖子，可根据用户的最新睡眠小记按相似度排序
    """
    def post(self, request):
        if os.environ.get('DISABLE_MODEL_LOADING') == 'true':
            return Response({'error': 'Similarity model is disabled'}, status=500)
        # 用户认证检查
        if not request.user.is_authenticated:
            return Response({'error': 'User is not authenticated'}, status=401)

        # 获取分页参数
        last_post_id = request.data.get('last_post_id')  # 分页的起始帖子 ID
        limit = 10  # 限制返回的帖子数量

        # 获取社区帖子
        if last_post_id:
            posts = ForumPost.objects.filter(id__lt=last_post_id).order_by('-created_at')[:limit]
        else:
            posts = ForumPost.objects.all().order_by('-created_at')[:limit]

        # 如果用户有最近的睡眠小记，按相似度排序
        latest_sleep_record = SleepRecord.objects.filter(user=request.user).order_by('-created_at').first()
        #model = get_embedding_model()

        if latest_sleep_record:
            # 用户最近的睡眠小记
            note = latest_sleep_record.note or ""  # 获取 note
            sleep_status = latest_sleep_record.sleep_status or ""  # 获取 sleep_status

            # 合并 note 和 sleep_status
            combined_input = f"{note},{sleep_status}"
            print(f"Combined input: {combined_input}")

            # 编码用户的睡眠记录嵌入向量
            user_embedding = model.encode(combined_input, normalize_embeddings=True)

            # 获取帖子嵌入向量并批量计算相似度
            post_embeddings = []
            post_objects = []

            for post in posts:
                if post.embedding:  # 如果帖子已存储嵌入向量
                    post_embeddings.append(post.embedding)
                else:  # 动态生成嵌入向量
                    embedding = model.encode(post.content, normalize_embeddings=True)
                    post_embeddings.append(embedding)

                    # 动态生成后保存到数据库，避免下次重复计算
                    post.embedding = embedding.tolist()
                    post.save()
                post_objects.append(post)

            # 批量计算相似度
            similarities = batch_calculate_similarities(user_embedding, post_embeddings)

            # 帖子与相似度配对并排序
            posts_with_similarity = sorted(
                zip(post_objects, similarities), key=lambda x: x[1], reverse=True
            )

            print("Sorted posts with similarities:")
            for post, similarity in posts_with_similarity:
                print(f"Post ID: {post.postid}, Similarity: {similarity:.4f}, Content: {post.content[:50]}")  # 只打印前50字符的内容

            # 排序后提取帖子对象
            sorted_posts = [post for post, _ in posts_with_similarity]
        else:
            # 如果没有睡眠小记，按创建时间排序
            print("No sleep record found, sorting by created time")
            sorted_posts = posts

        # 构建响应数据
        response_data = []
        for post in sorted_posts:
            response_data.append({
                'id': post.postid,
                'username': post.username,
                'content': post.content,
                'created_at': post.created_at,
                'picture_count': post.picture_count,
                'picture_names': post.picture_names,
                'likes': post.likes,
                'replies': post.replies,
                'reply_content': post.reply_content,
                'isliked': request.user.phone_number in post.like_user
            })

        return Response(response_data, status=200)

