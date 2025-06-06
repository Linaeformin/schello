from django.urls import path
from .views import logout_test_view
from . import views

urlpatterns = [
    path('logout-test/', logout_test_view, name='logout_test'),
    path('profile/', views.profile_view, name='profile'),
]
