from django.urls import path
from . import views

app_name = 'schedules'

urlpatterns = [
    path('api/schedules/', views.get_schedule_api, name='get_schedule_api'),
    path('<int:pk>/update_checked_status/', views.schedule_update_checked_status,
         name='schedule_update_checked_status'),
    path('add/', views.add_schedule_view, name='add_schedule'),
    path('schedules/<int:pk>/', views.edit_schedule_view, name='get_or_update_schedule'),
]