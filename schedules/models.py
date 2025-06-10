from django.db import models
# from accounts.models import Member
from django.conf import settings

class Schedule(models.Model):
    PRIORITY_CHOICES = [
        (1, '높음'),
        (2, '중간'),
        (3, '낮음'),
    ]

    # member = models.ForeignKey(Member, related_name = 'schedules', on_delete = models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name = 'schedules', on_delete = models.CASCADE, null = True, blank = True)
    title = models.CharField(max_length = 20)  # 공백 포함 20자 제한
    date = models.DateField()
    start = models.TimeField(blank = True, null = True)
    end = models.TimeField(blank = True, null = True)
    memo = models.TextField(max_length = 200, blank = True)
    priority = models.IntegerField(choices = PRIORITY_CHOICES, null = True, blank = True)
    is_checked = models.BooleanField(default=False) # 체크 필드 추가: False 완료 전 True 완료 상태

    def __str__(self):
        return f"{self.title} - {self.date} {self.start or ''} ~ {self.end or ''}"