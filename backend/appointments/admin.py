from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'appointment_date', 'service_type', 'is_confirmed')
    list_filter = ('is_confirmed', 'appointment_date', 'service_type')
    search_fields = ('full_name', 'email')
    actions = ['confirm_appointments']

    def confirm_appointments(self, request, queryset):
        queryset.update(is_confirmed=True)
