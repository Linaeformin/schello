from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from schedules.models import Schedule
from django.contrib.auth.decorators import login_required
import json
from django.shortcuts import redirect
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

@login_required
@require_http_methods(["POST"])
def delete(request, schedule_id):
    print(f"\n[삭제 요청] schedule_id={schedule_id}")
    print(f"[요청 유저] {request.user} (id={request.user.id})")

    try:
        schedule = get_object_or_404(Schedule, id=schedule_id)
        print(f"[일정 유저] {schedule.user} (id={schedule.user.id})")

        if schedule.user != request.user:
            print("❌ 유저 불일치: 삭제 거부")
            return HttpResponse("유저 불일치", status=403)

        schedule.delete()
        print("✅ 삭제 완료")
        return HttpResponse(status=204)

    except Exception as e:
        print("❌ 예외 발생:", e)
        return HttpResponse(status=500)




