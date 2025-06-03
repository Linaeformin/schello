from django.urls import path
from schedules.views import add_todo

urlpatterns = [
    path("add_todo/", add_todo),
]