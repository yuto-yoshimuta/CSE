from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

app_name = 'app'

# Main page URLs
urlpatterns = [
   path('', views.home, name='home'),
   path('get_updated_graph/', views.get_updated_graph, name='get_updated_graph'),
]

# Feature pages
urlpatterns += [
   path('exchange_rate/', views.exchange_rate, name='exchange_rate'),
   path('image_recognition/', views.image_recognition, name='image_recognition'),
   path('money/', views.money, name='money'),
   path('financing_ai_chat/', views.financing_ai_chat, name='financing_ai_chat'),
   path('reference/', views.reference, name='reference'),
]

# API endpoints
urlpatterns += [
   path('convert/', views.convert_currency, name='convert_currency'),
   path('start_camera/', views.start_camera, name='start_camera'),
   path('video_feed/<str:stream_id>', views.video_feed, name='video_feed'),
   path('get_exchange_rates/', views.get_exchange_rates, name='get_exchange_rates'),
   path('ask/', views.ask, name='ask'),
]

# Static files
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)