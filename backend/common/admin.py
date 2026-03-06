from django.contrib import admin
from .models import ContactMessage, Setting

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'destination', 'created_at')
    readonly_fields = ('created_at',)

@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'description')
