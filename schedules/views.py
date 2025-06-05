from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from schedules.forms import ScheduleForm
# from accounts.models import Member
from schedules.models import Schedule
from django.views.decorators.http import require_GET
from datetime import datetime

@login_required #로그인한 사용자만 접근 가능
def add_todo(request):
    if request.method == "POST":
        form = ScheduleForm(request.POST) #POST 요청으로 받은 데이터로 폼 생성
        if form.is_valid(): #유효성 검사
            schedule = form.save(commit=False)

            schedule.user = request.user

            schedule.save()
            return redirect("home") #저장한 후 홈 화면으로 이동
    else:
        form = ScheduleForm()
    return render(request, "schedules/add_todo.html", {'form': form}) #일정 추가 화면으로 이동

@require_GET
@login_required
def schedule_list_api(request):
    date_str = request.GET.get('date')

    if not date_str:
        return JsonResponse({'error': '날짜 파라미터가 필요합니다.'}, status=400) # 400 Bad Request

    try:
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'error': '유효하지 않은 날짜 형식입니다. YYYY-MM-DD 형식이어야 합니다.'}, status=400)



    try:
        schedules = Schedule.objects.filter(
            user=request.user,
            date=selected_date
        ).order_by('priority', 'start')

        data = []
        for schedule in schedules:
            data.append({
                'id': schedule.id,
                'date': schedule.date.isoformat(),
                'start': schedule.start.strftime('%H:%M') if schedule.start else '하루종일',
                'end': schedule.end.strftime('%H:%M') if schedule.end else None,
                'title': schedule.title,
                'memo': schedule.memo if schedule.memo else '메모 없음',
                'priority': schedule.priority,
            })
        return JsonResponse(data, safe=False)

    except Exception as e:
        return JsonResponse({'error': f'일정 불러오기 실패: {str(e)}'}, status=500)

@require_POST
@login_required
def schedule_delete_api(request, schedule_id):
    try:
        schedule = get_object_or_404(Schedule, id=schedule_id, user=request.user)

        schedule.delete()
        return JsonResponse({'message': '일정이 성공적으로 삭제되었습니다.'}, status=200)
    except Schedule.DoesNotExist:
        return JsonResponse({'error': '해당 일정을 찾을 수 없거나 삭제 권한이 없습니다.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'일정 삭제 실패: {str(e)}'}, status=500)