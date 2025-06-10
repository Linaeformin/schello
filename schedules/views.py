from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from schedules.forms import ScheduleForm
# from accounts.models import Member
from schedules.models import Schedule
from datetime import datetime
import json

@login_required
@require_http_methods(["GET"])
def get_schedule_api(request):
    try:
        # 요청에서 'date' 파라미터를 가져오고, 없으면 오늘 날짜를 기본값으로 사용
        date_str = request.GET.get('date', datetime.today().strftime('%Y-%m-%d'))

        # 날짜 문자열을 datetime 객체로 변환
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()

        # 현재 로그인된 사용자의 해당 날짜 일정만 필터링
        schedules = Schedule.objects.filter(user=request.user, date=selected_date).order_by('priority', 'start_time')

        # 일정 데이터를 JSON 형태로 직렬화
        schedule_data = []
        for schedule in schedules:
            schedule_data.append({
                'id': schedule.id,
                'title': schedule.title,
                'memo': schedule.memo,
                'date': schedule.date.strftime('%Y-%m-%d'),
                'start_time': schedule.start_time.strftime('%H:%M') if schedule.start_time else None,
                'end_time': schedule.end_time.strftime('%H:%M') if schedule.end_time else None,
                'priority': schedule.priority,
                'is_checked': schedule.is_checked,
            })
        return JsonResponse(schedule_data, safe=False)
    except ValueError:
        return JsonResponse({'error': '유효하지 않은 날짜 형식입니다. YYYY-MM-DD 형식으로 보내주세요.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'일정 불러오기 실패: {str(e)}'}, status=500)

@csrf_exempt
def schedule_update_checked_status(request, pk):
    if request.method == 'POST':
        try:
            schedule = Schedule.objects.get(pk=pk)
            data = json.loads(request.body)
            new_is_checked_status = data.get('is_checked')

            if new_is_checked_status is not None:
                schedule.is_checked = new_is_checked_status
                schedule.save()  # 변경사항을 데이터베이스에 저장
                return JsonResponse({
                    'status': 'success',
                    'id': schedule.pk,
                    'is_checked': schedule.is_checked
                })
            else:
                return JsonResponse({'status': 'error', 'message': 'is_checked 필드가 누락되었습니다.'}, status=400)

        except Schedule.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': '해당 일정을 찾을 수 없습니다.'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': '유효하지 않은 JSON 형식입니다.'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': '허용되지 않는 HTTP 메서드입니다.'}, status=405)