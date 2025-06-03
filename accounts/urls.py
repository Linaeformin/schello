from django.urls import path
from .views import logout_test_view

urlpatterns = [
    path('logout-test/', logout_test_view, name='logout_test'),
]
