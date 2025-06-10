from django.urls import path
from . import views

urlpatterns = [
    path('api/schedules/', views.get_schedule_api, name='get_schedule_api'),
    path('<int:pk>/update_checked_status/', views.schedule_update_checked_status,
         name='schedule_update_checked_status'),
]