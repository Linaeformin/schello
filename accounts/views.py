from django.shortcuts import render
from allauth.socialaccount.models import SocialAccount

# 홈페이지 뷰 함수 정의
def home(request):
    # 세션에서 'login_status' 값을 꺼내고, 꺼낸 후에는 세션에서 제거 (로그인 성공 / 실패 메시지 용도)
    login_status = request.session.pop('login_status', None)

    # 현재 로그인한 사용자의 소셜 계정 정보 가져오기 (없으면 None)
    social_account = SocialAccount.objects.filter(user = request.user).first()

    # 소셜 계정이 있다면 그 안의 추가 데이터를 가져오고, 없으면 빈 딕셔너리
    extra_data = social_account.extra_data if social_account else {}

    # 템플릿에 넘겨줄 context 딕셔너리 정의
    context = {
        'login_status': login_status,
        'user': request.user,
        'extra_data': extra_data,
    }

    # 'accounts/base.html' 템플릿을 렌더링하면서 context를 넘겨줌
    return render(request, 'base.html', context)

# 로그아웃 테스트 코드
def logout_test_view(request):
    return render(request, 'accounts/profile.html')
