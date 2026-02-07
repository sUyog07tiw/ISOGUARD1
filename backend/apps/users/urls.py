from django.urls import path
from .views import register, login, refresh_token, get_user_profile, update_user_profile

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('refresh/', refresh_token, name='refresh_token'),
    path('profile/', get_user_profile, name='get_profile'),
    path('profile/update/', update_user_profile, name='update_profile'),
]
