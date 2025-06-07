from django.urls import path
from .views import logout
from . import views
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path('logout/', logout, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('update/', views.update_profile_image, name='update_profile_image'),
]
