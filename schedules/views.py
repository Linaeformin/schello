from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from schedules.forms import ScheduleForm
from accounts.models import Member

@login_required #로그인한 사용자만 접근 가능
def add_todo(request):
    if request.method == "POST":
        form = ScheduleForm(request.POST) #POST 요청으로 받은 데이터로 폼 생성
        if form.is_valid(): #유효성 검사
            schedule = form.save(commit=False)

            try:
                schedule.member = Member.objects.get(user=request.user)
            except Member.DoesNotExist:
                form.add_error(None, "사용자 프로필 정보를 찾을 수 없습니다.")
                return render(request, "schedules/add_todo.html", {'form': form})

            schedule.save()
            return redirect("home") #저장한 후 홈 화면으로 이동
    else:
        form = ScheduleForm()
    return render(request, "schedules/add_todo.html", {'form': form}) #일정 추가 화면으로 이동