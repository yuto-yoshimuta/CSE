from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

app_name = 'app'

urlpatterns = [
    path('', views.index, name='index'),
    path('exchange_rate/', views.exchange_rate, name='exchange_rate'),
    path('mitei/', views.mitei, name='mitei'),  # 追加
    path('image_recognition/', views.image_recognition, name='image_recognition'),
    path('start_camera/', views.start_camera, name='start_camera'),
    path('video_feed/<str:stream_id>', views.video_feed, name='video_feed'),
    path('money/', views.money, name='money'),  # お金説明
    path('convert/', views.convert_currency, name='convert_currency'),  # 為替変換用
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)