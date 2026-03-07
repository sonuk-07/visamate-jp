from django.contrib import admin
from .models import ContactMessage, Setting, EmailOTP, UserProfile, UserDocument

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
    exclude = ('otp_code',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'nationality')
    search_fields = ('user__username', 'user__email', 'phone')

@admin.register(UserDocument)
class UserDocumentAdmin(admin.ModelAdmin):
    list_display = ('user', 'document_type', 'title', 'uploaded_at')
    list_filter = ('document_type',)
    search_fields = ('user__username', 'title')
