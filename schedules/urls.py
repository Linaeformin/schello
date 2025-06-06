from django.urls import path
from . import views

urlpatterns = [
    path("add_todo/", views.add_todo, name='add_todo'),
    path('api/schedules/', views.schedule_list_api, name='schedule_list_api'),
    path('api/schedules/<int:schedule_id>/delete/', views.schedule_delete_api, name='schedule_delete_api'),
]