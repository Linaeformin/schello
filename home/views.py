from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from schedules.models import Schedule
from django.contrib.auth.decorators import login_required
from datetime import datetime

@login_required
def home_view(request):
    return render(request, 'home/home.html')

@login_required
def get_schedule_api(request):
    selected_date_str = request.GET.get('date')

    if not selected_date_str:
        return JsonResponse({'error': '데이터 파라미터 없음'}, status=400)

    try:
        selected_date = datetime.strptime(selected_date_str, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'error': '날짜 형식 오류, 필요 형식: YYYY-MM-DD'}, status=400)

    schedules = Schedule.objects.filter(user=request.user, date=selected_date).order_by('priority', 'start')

    schedule_data = []
    for schedule in schedules:
        schedule_data.append({
            'id': schedule.id,
            'date': schedule.date.isoformat(),
            'time': f"{schedule.start.strftime('%H:%M')} - {schedule.end.strftime('%H:%M')}" if schedule.start and schedule.end else "",
            'title': schedule.title,
            'memo': schedule.memo,
            'priority': schedule.priority,
        })

    return JsonResponse(schedule_data, safe=False)

@login_required
@require_http_methods(["DELETE"])
def delete_schedule_api(request, schedule_id):
    try:
        schedule = get_object_or_404(Schedule, id=schedule_id, user=request.user)
        schedule.delete()
        return JsonResponse({'message': '일정 삭제 성공'})
    except Exception as e:
        return JsonResponse({'일정 삭제 실패': str(e)}, status=400)