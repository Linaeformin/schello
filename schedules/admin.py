from django.contrib import admin
from django import forms
from schedules.models import Schedule

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'date',
        'start',
        'end',
        'user',
        'priority',
        'memo',
        'is_checked',
    ]

    def formfield_for_dbfield(self, db_field, **kwargs):
        if db_field.name == 'date':
            kwargs['widget'] = forms.DateInput(attrs={'type': 'date'})
        elif db_field.name == 'start_time' or db_field.name == 'end_time':
            kwargs['widget'] = forms.TimeInput(attrs={'type': 'time'})
        return super().formfield_for_dbfield(db_field, **kwargs)