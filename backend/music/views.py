import mimetypes
from fileinput import filename

from django.http import FileResponse
from django.shortcuts import render

# Create your views here.

from django.conf import settings
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, JSONParser

from .models import Music
import os
from mutagen import File
class MusicView(APIView):

    def get(self, request, *args, **kwargs):
        name = request.GET.get('name')
        if name is None:
            return Response({'error': 'No name provided'}, status=status.HTTP_400_BAD_REQUEST)
        if Music.objects.filter(name=name).exists():
            savepath = os.path.join(settings.MEDIA_ROOT, 'music')
            filepath = os.path.join(savepath, name)
            if os.path.exists(filepath):
                mime_type, _ = mimetypes.guess_type(filepath)
                mime_type = mime_type or 'audio/mpeg'

                response = FileResponse(open(filepath, 'rb'), content_type=mime_type)
                response['Content-Disposition'] = f'inline; filename="{name}"'   # Stream
                return response
            else:
                Music.objects.filter(name=name).delete()
                return Response({'error': 'File with name {} exist in history, but cannot found'.format(name)}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'File with name {} does not exist'.format(name)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        name = request.data.get('name')
        if name is None:
            return Response({'error': 'No name provided'}, status=status.HTTP_400_BAD_REQUEST)
        if Music.objects.filter(name=name).exists():
            savepath = os.path.join(settings.MEDIA_ROOT, 'music')
            filepath = os.path.join(savepath, name)
            try:
                if os.path.exists(filepath):
                    os.remove(filepath)
                Music.objects.filter(name=name).delete()
                return Response({'message': 'File with name {} deleted'.format(name)}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'error': 'File with name {} does not exist'.format(name)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        name = request.data.get('name')
        if file is None:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        if name is None:
            return Response({'error': 'No name provided'}, status=status.HTTP_400_BAD_REQUEST)
        if Music.objects.filter(name=name).exists():
            return Response({'error': 'File with name {} already exists'.format(name)},
                            status=status.HTTP_400_BAD_REQUEST)
        savepath = os.path.join(settings.MEDIA_ROOT, 'music')
        filepath = os.path.join(savepath, name)
        try:
            with open(filepath, 'wb+') as f:
                for item in file.chunks():
                    f.write(item)
            audio = File(filepath)
            if audio is None or not hasattr(audio, 'info'):
                return Response({'error': 'Unable to read audio file duration'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            duration = audio.info.length
            duration = int(duration)
            Music.objects.create(name=name,duration=duration)
            return Response({'message': 'File with name {} has been saved'.format(name)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MusicListView(APIView):
    def get(self, request, *args, **kwargs):
        musics = Music.objects.all()
        music_list = []
        for music in musics:
            m = [music.name, music.duration]
            music_list.append(m)
        return Response({'music_list': music_list}, status=status.HTTP_200_OK)
