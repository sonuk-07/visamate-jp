from django.contrib import admin
from .models import ContactMessage, Setting, EmailOTP

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'destination', 'created_at')
    readonly_fields = ('created_at',)

@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'description')

@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ('email', 'purpose', 'is_used', 'created_at')
    list_filter = ('purpose', 'is_used')
    readonly_fields = ('created_at',)
