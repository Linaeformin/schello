from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from schedules.forms import ScheduleForm
# from accounts.models import Member
from schedules.models import Schedule
from datetime import datetime
import json

@require_POST
@login_required
def schedule_create_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))

        title = data.get('title')
        date_str = data.get('date')

        if not title:
            return JsonResponse({'error': '제목은 필수 항목입니다.'}, status=400)
        if not date_str:
            return JsonResponse({'error': '날짜는 필수 항목입니다.'}, status=400)

        if not isinstance(title, str) or not (1 <= len(title) <= 20):
            return JsonResponse({'error': '제목은 1자 이상 20자 이하의 문자열이어야 합니다.'}, status=400)

        try:
            schedule_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return JsonResponse({'error': '유효하지 않은 날짜 형식입니다. ISO 8601 (YYYY-MM-DD) 형식이어야 합니다.'}, status=400)

        start_time = None
        if 'start' in data and data['start'] not in [None, '']:
            try:
                start_time = datetime.strptime(data['start'], '%H:%M').time()
            except ValueError:
                return JsonResponse({'error': '유효하지 않은 시작 시간 형식입니다. HH:MM 형식이어야 합니다.'}, status=400)

        end_time = None
        if 'end' in data and data['end'] not in [None, '']:
            try:
                end_time = datetime.strptime(data['end'], '%H:%M').time()
            except ValueError:
                return JsonResponse({'error': '유효하지 않은 종료 시간 형식입니다. HH:MM 형식이어야 합니다.'}, status=400)

        memo = data.get('memo', '')
        if not isinstance(memo, str) or len(memo) > 200:
            return JsonResponse({'error': '메모는 200자 이하의 문자열이어야 합니다.'}, status=400)

        priority = None
        if 'priority' in data and data['priority'] not in [None, '']:
            try:
                priority_int = int(data['priority'])
                if priority_int not in [choice[0] for choice in Schedule.PRIORITY_CHOICES]:
                    return JsonResponse({
                                            'error': f'유효하지 않은 우선순위 값입니다. 허용된 값은 {", ".join(str(c[0]) for c in Schedule.PRIORITY_CHOICES)} 입니다.'},
                                        status=400)
                priority = priority_int
            except ValueError:
                return JsonResponse({'error': '우선순위는 숫자여야 합니다.'}, status=400)

        if start_time is not None and end_time is not None and start_time > end_time:
            return JsonResponse({'error': '시작 시간은 종료 시간보다 빠르거나 같아야 합니다.'}, status=400)

        schedule = Schedule.objects.create(
            user=request.user,
            title=title,
            date=schedule_date,
            start=start_time,
            end=end_time,
            memo=memo,
            priority=priority
        )

        return JsonResponse({'message': '일정이 성공적으로 추가되었습니다.', 'schedule_id': schedule.id}, status=201)  # 201 Created

    except Exception as e:
        return JsonResponse({'error': f'일정 추가 실패: {str(e)}'}, status=500)


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
            })
        return JsonResponse(schedule_data, safe=False)
    except ValueError:
        return JsonResponse({'error': '유효하지 않은 날짜 형식입니다. YYYY-MM-DD 형식으로 보내주세요.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'일정 불러오기 실패: {str(e)}'}, status=500)

@require_POST
@login_required
def schedule_delete_api(request, schedule_id):
    try:
        schedule = get_object_or_404(Schedule, id=schedule_id, user=request.user)

        schedule.delete()
        return JsonResponse({'message': '일정이 성공적으로 삭제되었습니다.'}, status=200)

    except Exception as e:
        return JsonResponse({'error': f'일정 삭제 실패: {str(e)}'}, status=500)


@require_http_methods(["PUT", "PATCH"])
@login_required
def schedule_update_api(request, schedule_id):
    try:
        schedule = get_object_or_404(Schedule, id=schedule_id, user=request.user)

        data = json.loads(request.body.decode('utf-8'))

        if 'title' in data:
            title_value = data['title']
            if not isinstance(title_value, str) or not (1 <= len(title_value) <= 20):
                return JsonResponse({'error': '제목은 1자 이상 20자 이하의 문자열이어야 합니다.'}, status=400)
            schedule.title = title_value

        if 'date' in data:
            try:
                schedule.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                return JsonResponse({'error': '유효하지 않은 날짜 형식입니다. YYYY-MM-DD 형식이어야 합니다.'}, status=400)

        if 'start' in data:
            if data['start'] is None or data['start'] == '':
                schedule.start = None
            else:
                try:
                    schedule.start = datetime.strptime(data['start'], '%H:%M').time()
                except ValueError:
                    return JsonResponse({'error': '유효하지 않은 시작 시간 형식입니다. HH:MM 형식이어야 합니다.'}, status=400)

        if 'end' in data:
            if data['end'] is None or data['end'] == '':
                schedule.end = None
            else:
                try:
                    schedule.end = datetime.strptime(data['end'], '%H:%M').time()
                except ValueError:
                    return JsonResponse({'error': '유효하지 않은 종료 시간 형식입니다. HH:MM 형식이어야 합니다.'}, status=400)

        if 'memo' in data:
            memo_value = data['memo']
            if not isinstance(memo_value, str) or len(memo_value) > 200:
                return JsonResponse({'error': '메모는 200자 이하의 문자열이어야 합니다.'}, status=400)
            schedule.memo = memo_value

        if 'priority' in data:
            priority_value = data['priority']
            if priority_value is None or priority_value == '':
                schedule.priority = None
            else:
                try:
                    priority_int = int(priority_value)
                    if priority_int not in [choice[0] for choice in Schedule.PRIORITY_CHOICES]:
                        return JsonResponse({
                                                'error': f'유효하지 않은 우선순위 값입니다. 허용된 값은 {", ".join(str(c[0]) for c in Schedule.PRIORITY_CHOICES)} 입니다.'},
                                            status=400)
                    schedule.priority = priority_int
                except ValueError:
                    return JsonResponse({'error': '우선순위는 숫자여야 합니다.'}, status=400)

        if schedule.start is not None and schedule.end is not None and schedule.start > schedule.end:
            return JsonResponse({'error': '시작 시간은 종료 시간보다 빠르거나 같아야 합니다.'}, status=400)

        schedule.save()
        return JsonResponse({'message': '일정이 성공적으로 수정되었습니다.', 'schedule_id': schedule.id}, status=200)

    except Exception as e:
        return JsonResponse({'error': f'일정 수정 실패: {str(e)}'}, status=500)