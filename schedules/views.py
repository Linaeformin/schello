from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from schedules.forms import ScheduleForm
# from accounts.models import Member
from schedules.models import Schedule
from datetime import datetime, date, time
import json

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

def add_schedule_view(request):
    if request.method == 'POST':
        title = request.POST.get('todo')
        memo = request.POST.get('memo', '')

        # 날짜 데이터 (년, 월, 일)
        year = request.POST.get('year')
        month = request.POST.get('month')
        day = request.POST.get('day')

        # 시간 데이터 (시작 시간, 종료 시간)
        start_hour_str = request.POST.get('start-hour')
        start_minute_str = request.POST.get('start-minute')
        end_hour_str = request.POST.get('end-hour')
        end_minute_str = request.POST.get('end-minute')

        # 우선순위 데이터
        priority_str = request.POST.get('priority-radio')
        priority = int(priority_str) if priority_str else None

        # 필수 필드 유효성 검사
        if not all([title, year, month, day]):
            return JsonResponse({'error_message': '필수 필드를 모두 입력해주세요.'}, status=400)

        try:
            # 날짜 필드 생성 (date 객체)
            schedule_date = date(int(year), int(month), int(day))

            # 시작 시간 필드 생성 (time 객체)
            start_time = None
            if start_hour_str and start_minute_str:
                start_time = time(int(start_hour_str), int(start_minute_str))

            # 종료 시간 필드 생성 (time 객체)
            end_time = None
            if end_hour_str and end_minute_str:
                end_time = time(int(end_hour_str), int(end_minute_str))

            # Schedule 객체 생성 및 저장
            schedule = Schedule(
                user=request.user if request.user.is_authenticated else None,
                title=title,
                date=schedule_date,
                start=start_time,
                end=end_time,
                memo=memo,
                priority=priority,
                is_checked=False
            )
            schedule.save()

            return JsonResponse({
                'status': 'success',
                'id': schedule.id,
                'title': schedule.title,
                'message': '일정이 성공적으로 추가되었습니다.'
            }, status=201)  # 201 Created

        except (ValueError, TypeError) as e:
            return render(request, 'components/add-todo-sheet.html', {'error_message': f'날짜/시간 형식이 올바르지 않습니다: {e}'})
        except Exception as e:
            return render(request, 'components/add-todo-sheet.html', {'error_message': f'일정 저장 중 오류가 발생했습니다: {e}'})

    else:
        # GET 요청일 경우 (폼 페이지를 처음 로드할 때)
        today = date.today()
        initial_data = {
            'year': today.year,
            'month': today.month,
            'day': today.day,
        }
        return render(request, 'components/add-todo-sheet.html', {'initial_data': initial_data})

@require_http_methods(["GET", "POST"])
def edit_schedule_view(request, pk):
    schedule = get_object_or_404(Schedule, pk=pk, user=request.user)

    if request.method == 'POST':
        title = request.POST.get('todo')
        memo = request.POST.get('memo', '')

        year = request.POST.get('year')
        month = request.POST.get('month')
        day = request.POST.get('day')

        start_hour_str = request.POST.get('start-hour')
        start_minute_str = request.POST.get('start-minute')
        end_hour_str = request.POST.get('end-hour')
        end_minute_str = request.POST.get('end-minute')

        priority_str = request.POST.get('priority-radio')
        priority = int(priority_str) if priority_str else None

        if not all([title, year, month, day]):
            return JsonResponse({'error_message': '필수 필드를 모두 입력해주세요.'}, status=400)

        try:
            schedule_date = date(int(year), int(month), int(day))

            start_time = None
            if start_hour_str and start_minute_str:
                start_time = time(int(start_hour_str), int(start_minute_str))

            end_time = None
            if end_hour_str and end_minute_str:
                end_time = time(int(end_hour_str), int(end_minute_str))

            # Schedule 객체 필드 업데이트
            schedule.title = title
            schedule.date = schedule_date
            schedule.start_time = start_time
            schedule.end_time = end_time
            schedule.memo = memo
            schedule.priority = priority

            schedule.save()

            return JsonResponse({
                'status': 'success',
                'id': schedule.id,
                'title': schedule.title,
                'message': '일정이 성공적으로 수정되었습니다.'
            })

        except (ValueError, TypeError) as e:
            return render(request, 'components/edit-todo-sheet.html', {
                'schedule': schedule,
                'error_message': f'날짜/시간 형식이 올바르지 않습니다: {e}'
            })
        except Exception as e:
            return render(request, 'components/edit-todo-sheet.html', {
                'schedule': schedule,
                'error_message': f'일정 수정 중 오류가 발생했습니다: {e}'
            })

    else:
        # GET 요청 시, 현재 일정 데이터를 폼에 미리 채워주기
        initial_data = {
            'pk': schedule.pk,
            'title': schedule.title,
            'memo': schedule.memo,
            'year': schedule.date.year,
            'month': schedule.date.month,
            'day': schedule.date.day,
            'start_hour': schedule.start_time.hour if schedule.start_time else '',
            'start_minute': schedule.start_time.minute if schedule.start_time else '',
            'end_hour': schedule.end_time.hour if schedule.end_time else '',
            'end_minute': schedule.end_time.minute if schedule.end_time else '',
            'priority': schedule.priority,
            'is_checked': schedule.is_checked,
        }
        return render(request, 'components/edit-todo-sheet.html', {'schedule': schedule, 'initial_data': initial_data})
