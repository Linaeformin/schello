from allauth.account.signals import user_signed_up
from django.dispatch import receiver
from .models import Member
from allauth.socialaccount.models import SocialAccount
from allauth.account.signals import user_logged_in


# 1. 최초 가입 시 실행 → 기본 이름과 이미지 저장
@receiver(user_signed_up)
def create_member(sender, request, user, **kwargs):
    if not hasattr(user, 'member'):
        # 기본 이름
        name = user.username

        # 소셜 계정에서 카카오 프로필 이미지 가져오기
        social_account = SocialAccount.objects.filter(user = user).first()
        profile_img_url = ""
        if social_account:
            profile_img_url = social_account.extra_data.get('thumbnail_image', '')

        # Member 생성하면서 프로필 이미지 URL도 저장
        Member.objects.create(
            user = user,
            name = name,
            img_url = profile_img_url
        )

# 2. 소셜 계정 연결된 직후 → profile_image_url 확실히 가져와서 Member 업데이트
@receiver(user_logged_in)
def update_profile_image_on_login(request, user, **kwargs):

    try:
        social_account = SocialAccount.objects.filter(user = user).first()
        if not social_account:
            return

        extra_data = social_account.extra_data
        profile_img_url = (
            extra_data.get('kakao_account', {})
            .get('profile', {})
            .get('thumbnail_image_url', '')
        )

        member, created = Member.objects.get_or_create(user = user)
        member.img_url = profile_img_url
        member.save()

    except Exception as e:
        print("시그널 오류:", e)




