import base64
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from .models import ForumPost, ForumPicture
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

from rest_framework.response import Response
import hashlib
import time

@login_required
@require_POST
def get_forum_posts(request):
    access_token = request.headers.get('Authorization')
    if not access_token:
        return Response({'error': 'Access token is required'}, status=401)
    
    last_post_id = request.data.get('last_post_id')
    limit = 10

    if last_post_id:
        posts = ForumPost.objects.filter(id__lt=last_post_id).order_by('-created_at')[:limit]
    else:
        posts = ForumPost.objects.all().order_by('-created_at')[:limit]

    response_data = []
    for post in posts:
        response_data.append({
            'id': post.id,
            'username': post.username,
            'content': post.content,
            'created_at': post.created_at,
            'picture_count': post.picture_count,
            'likes': post.likes,
            'replies': post.replies,
            'reply_content': post.reply_content,
            'isliked': request.user.phone_number in post.like_user
        })

    return Response(response_data, status=200)


@login_required
@require_POST
def get_forum_picture(request, postid, picture_index):
    access_token = request.headers.get('Authorization')
    if not access_token:
        return Response({'error': 'Access token is required'}, status=401)
    picture = get_object_or_404(ForumPicture, postid=postid, picture_index=picture_index)
    if picture is None:
        return JsonResponse({'error': 'Picture not found'})
    try:
        with open(picture.url.path, 'rb') as f:
            encode_str = base64.b64encode(f.read()).decode('utf-8')
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    return Response({'image': encode_str}, status=200)


@login_required
@require_POST
def create_forum_post(request):
    access_token = request.headers.get('Authorization')
    if not access_token:
        return Response({'error': 'Access token is required'}, status=401)
    username = request.user.phone_number
    content = request.data.get('content')
    picture_count = request.data.get('picture_count')
    # picture_names is a list of filenames, each is the response of the upload api
    picture_names = request.data.get('picture_names')
    if not content:
        return Response({'error': 'Content is required'}, status=400)
    post = ForumPost.objects.create(username=username, content=content, picture_count=picture_count, picture_urls=picture_urls)
    return Response({'postid': post.postid, 'created_at': post.created_at}, status=201)


@login_required
@require_POST
def create_forum_picture(request):
    access_token = request.headers.get('Authorization')
    if not access_token:
        return Response({'error': 'Access token is required'}, status=401)
    
    image_type = request.data.get('image_type')
    if not image_type:
        return Response({'error': 'Image type is required'}, status=400)
    image_data = request.data.get('image_data')
    if not image_data:
        return Response({'error': 'Image data is required'}, status=400)
    
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
    image_path = f'forum_pictures/{filename}'
    
    with open(image_path, 'wb') as f:
        f.write(image_bytes)
    
    picture = ForumPicture.objects.create(url=image_path)
    
    return Response({'filename': filename}, status=201)


@login_required
@require_POST
def like_forum_post(request):
    access_token = request.headers.get('Authorization')
    if not access_token:
        return Response({'error': 'Access token is required'}, status=401)
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


@login_required
@require_POST
def reply_forum_post(request):
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
    return Response({'replies': post.replies}, status=200)
