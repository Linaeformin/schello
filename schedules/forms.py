from django import forms
from schedules.models import Schedule

class ScheduleForm(forms.ModelForm):
    class Meta:
        model = Schedule
        fields = [
            "title",
            "memo",
            "date",
            "start",
            "end",
            "priority",
        ]

        # 폼 필드 타입 설정
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
            'start': forms.DateTimeInput(attrs={'type': 'time'}),
            'end': forms.DateTimeInput(attrs={'type': 'time'}),
            'memo': forms.Textarea(attrs={'rows': 3}),
        }