from django.urls import path
from . import views

urlpatterns = [
    path('api/schedules/', views.schedule_list_api, name='schedule_list_api'),
    path('api/schedules/create/', views.schedule_create_api, name='schedule_create_api'),
    path('api/schedules/<int:schedule_id>/delete/', views.schedule_delete_api, name='schedule_delete_api'),
    path('api/schedules/<int:schedule_id>/update/', views.schedule_update_api, name='schedule_update_api'),
]