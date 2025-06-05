from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('api/schedules/', views.get_schedule_api, name='api_schedule'),
    path('api/schedules/<int:schedule_id>/delete/', views.delete_schedule_api, name='api_delete_schedule')
]