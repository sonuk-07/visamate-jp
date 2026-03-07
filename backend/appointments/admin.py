from django.contrib import admin
from .models import Appointment, AppointmentSlot


@admin.register(AppointmentSlot)
class AppointmentSlotAdmin(admin.ModelAdmin):
    list_display = ('date', 'start_time', 'end_time', 'service_type', 'max_bookings', 'current_bookings', 'is_available', 'is_active')
    list_filter = ('is_active', 'service_type', 'date')
    ordering = ('date', 'start_time')
    date_hierarchy = 'date'
    
    def current_bookings(self, obj):
        return obj.current_bookings
    current_bookings.short_description = 'Booked'
    
    def is_available(self, obj):
        return obj.is_available
    is_available.boolean = True


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'appointment_date', 'service_type', 'status', 'is_confirmed')
    list_filter = ('status', 'is_confirmed', 'appointment_date', 'service_type')
    search_fields = ('full_name', 'email')
    actions = ['confirm_appointments', 'cancel_appointments']

    def confirm_appointments(self, request, queryset):
        queryset.update(status='confirmed', is_confirmed=True)
    confirm_appointments.short_description = 'Confirm selected appointments'

    def cancel_appointments(self, request, queryset):
        queryset.update(status='cancelled')
    cancel_appointments.short_description = 'Cancel selected appointments'
