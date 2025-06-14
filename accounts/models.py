from django.contrib.auth.models import User
from django.db import models


class Member(models.Model):
    user = models.OneToOneField(User, on_delete = models.CASCADE)
    img_url = models.URLField(null = True, blank = True)
    name = models.CharField(max_length = 100)

    def __str__(self):
        return self.name