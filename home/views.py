from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from schedules.models import Schedule
from django.contrib.auth.decorators import login_required
import json
from datetime import datetime

@login_required
def home_view(request):
    schedules = Schedule.objects.filter(user=request.user).order_by('date', 'priority', 'start')

    data = []
    for s in schedules:
        if s.start and s.end:
            time = f"{s.start.strftime('%H:%M')} - {s.end.strftime('%H:%M')}"
        elif s.start:
            time = f"{s.start.strftime('%H:%M')} ~"
        elif s.end:
            time = f"~ {s.end.strftime('%H:%M')}"
        else:
            time = "하루종일"

        data.append({
            "id": s.id,
            "date": s.date.strftime('%Y-%m-%d'),
            "title": s.title,
            "memo": s.memo or "메모 없음",
            "time": time,
            "priority": s.priority,
            "is_checked": s.is_checked,
        })

    return render(request, 'home/home.html', {
        'schedules_json': json.dumps(data, ensure_ascii=False)
    })