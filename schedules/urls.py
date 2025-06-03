from django.urls import path
from schedules.views import schedule_add

urlpatterns = [
    path("schedule_add", schedule_add),
]