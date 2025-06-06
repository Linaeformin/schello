from django.db import models
from django.contrib.auth.models import User

class Schedule(models.Model):
    PRIORITY_CHOICES = [
        (1, '높음'),
        (2, '중간'),
        (3, '낮음'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length = 20)  # 공백 포함 20자 제한
    date = models.DateField()
    start = models.DateTimeField(blank = True, null = True)
    end = models.DateTimeField(blank = True, null = True)
    memo = models.TextField(max_length = 200, blank = True)
    priority = models.IntegerField(choices = PRIORITY_CHOICES, null = True, blank = True)

    def __str__(self):
        return f"{self.title} - {self.date}"

