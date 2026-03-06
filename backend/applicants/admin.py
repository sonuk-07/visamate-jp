from django.contrib import admin
from .models import Applicant, Document

class DocumentInline(admin.TabularInline):
    model = Document
    extra = 1

@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'passport_number')
    inlines = [DocumentInline]

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'applicant', 'uploaded_at')
