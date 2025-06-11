from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('<int:schedule_id>/delete/', views.delete, name='schedule-delete'),
]