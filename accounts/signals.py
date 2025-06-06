from allauth.account.signals import user_signed_up
from django.dispatch import receiver
from .models import Member

@receiver(user_signed_up)
def create_member(sender, request, user, **kwargs):
    if not hasattr(user, 'member'):
        Member.objects.create(user=user, name=user.username)
