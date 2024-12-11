from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken

blocks = [
    '/api/logout/',
    '/api/sleep-records/',
    '/api/sleep-analysis/',
    '/api/sleep-data/',
    '/api/forum/posts/',
    '/api/forum/get_picture/',
    '/api/forum/create_post/',
    '/api/forum/create_picture/',
    '/api/forum/like_post/',
    '/api/forum/reply_post/',
    '/api/forum/delete_post/',
    '/api/forum/similarity_posts/'
]

class AuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path in blocks:
            authorization_header = request.headers.get('Authorization')
            if not authorization_header or not authorization_header.startswith('Bearer '):
                return JsonResponse({'error': 'Unauthorized'}, status=401)
            token = authorization_header.split(' ')[1]
            try:
                AccessToken(token)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=401)
        return self.get_response(request)
