from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

app_name = 'app'

# Main page URLs
urlpatterns = [
   path('', views.index, name='index'),
   path('get_updated_graph/', views.get_updated_graph, name='get_updated_graph'),
]

# Feature pages
urlpatterns += [
   path('exchange_rate/', views.exchange_rate, name='exchange_rate'),
   path('image_recognition/', views.image_recognition, name='image_recognition'),
   path('money/', views.money, name='money'),
   path('mitei/', views.mitei, name='mitei'),
]

# API endpoints
urlpatterns += [
   path('convert/', views.convert_currency, name='convert_currency'),
   path('start_camera/', views.start_camera, name='start_camera'),
   path('video_feed/<str:stream_id>', views.video_feed, name='video_feed'),
]

# Media files
if settings.DEBUG:
   urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)