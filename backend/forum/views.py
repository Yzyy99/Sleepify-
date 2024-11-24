import base64
import json
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from .models import ForumPost, ForumPicture
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

from rest_framework.response import Response
from rest_framework.views import APIView
import hashlib
import time


class GetForumPosts(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'User is not authenticated'}, status=401)
        
        last_post_id = request.data.get('last_post_id')
        limit = 10

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
        post = ForumPost.objects.create(username=username, content=content, picture_count=str(picture_count), picture_names=picture_names)
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

