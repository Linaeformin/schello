from django.http import JsonResponse
from django.shortcuts import render
from allauth.socialaccount.models import SocialAccount
from django.contrib.auth.decorators import login_required
from .models import Member
import logging
logger = logging.getLogger(__name__)

from django.conf import settings
from allauth.socialaccount.models import SocialApp

# 홈페이지 뷰 함수 정의
def home(request):
    login_status = request.session.pop('login_status', None)

    social_account = None
    extra_data = {}

    if request.user.is_authenticated:
        social_account = SocialAccount.objects.filter(user = request.user).first()
        extra_data = social_account.extra_data if social_account else {}

    context = {
        'login_status': login_status,
        'user': request.user,
        'extra_data': extra_data,
    }

    return render(request, 'base.html', context)


# 로그아웃 테스트 코드
def logout_test_view(request):
    return render(request, 'accounts/profile.html')

# 프로필에서 유저 정보를 가져오는 코드
@login_required
def profile_view(request):
    user = request.user

    # 존재하지 않으면 자동 생성
    member, created = Member.objects.get_or_create(
        user=user,
        defaults={
            'name': user.username,
            'img_url': '/static/accounts/default-profile.png'
        }
    )

    context = {
        'user_name': member.name,
        'user_email': user.email,
        'img_url': member.img_url or '/static/accounts/default-profile.png',
    }
    return render(request, 'accounts/profile.html', context)