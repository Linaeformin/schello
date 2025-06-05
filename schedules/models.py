from django.db import models
# from accounts.models import Member
from django.conf import settings
from django.utils import timezone

class Schedule(models.Model):
    # member = models.ForeignKey(Member, related_name = 'schedules', on_delete = models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name = 'schedules', on_delete = models.CASCADE)
    title = models.CharField(max_length = 20)  # 공백 포함 20자 제한
    date = models.DateField(default=timezone.now) # 현재 날짜 자동 설정
    start = models.TimeField(blank = True, null = True)
    end = models.TimeField(blank = True, null = True)
    memo = models.TextField(max_length = 200, blank = True)
    PRIORITY_CHOICES = [
        (1, '높음'),
        (2, '중간'),
        (3, '낮음'),
    ]
    priority = models.IntegerField(choices = PRIORITY_CHOICES, null = True, blank = True)

    def __str__(self):
        return f"{self.title} - {self.date}"

