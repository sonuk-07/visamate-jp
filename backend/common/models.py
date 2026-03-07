"""
Common Models Module
====================

This module defines shared database models used across the application
for settings management and contact form submissions.

Models:
    - Setting: Key-value store for application configuration
    - ContactMessage: Stores contact form submissions from website

Usage:
    from common.models import Setting, ContactMessage
    
    # Get a setting value
    setting = Setting.objects.get(key='site_name')
    print(setting.value)
    
    # Create a contact message
    message = ContactMessage.objects.create(
        name='Jane Doe',
        email='jane@example.com',
        message='I have a question...'
    )
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator


class UserProfile(models.Model):
    """Extended profile info attached to each user via one-to-one."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True, default='')
    date_of_birth = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True, default='')
    passport_number = models.CharField(max_length=50, blank=True, default='')
    address = models.TextField(blank=True, default='')

    def __str__(self):
        return f"Profile: {self.user.username}"


class UserDocument(models.Model):
    """Personal documents uploaded by users (passport, ID, etc.)."""
    DOCUMENT_TYPES = [
        ('passport', 'Passport'),
        ('national_id', 'National ID'),
        ('birth_certificate', 'Birth Certificate'),
        ('academic_transcript', 'Academic Transcript'),
        ('language_certificate', 'Language Certificate'),
        ('resume', 'Resume / CV'),
        ('photo', 'Passport Photo'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_documents')
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=255)
    file = models.FileField(
        upload_to='user_documents/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'])],
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class Setting(models.Model):
    """
    Key-value store for application configuration settings.
    
    Provides a flexible way to store application-wide configuration
    values that can be modified without code changes.
    
    Attributes:
        key (str): Unique setting identifier (max 100 chars).
        value (str): Setting value (can be any length).
        description (str): Optional description of the setting.
    
    Example:
        >>> Setting.objects.create(
        ...     key='company_name',
        ...     value='VisaMate Japan',
        ...     description='The company display name'
        ... )
    """
    
    key = models.CharField(
        max_length=100, 
        unique=True,
        help_text="Unique identifier for this setting"
    )
    value = models.TextField(
        help_text="The setting value"
    )
    description = models.CharField(
        max_length=255, 
        blank=True,
        help_text="Optional description of what this setting does"
    )

    class Meta:
        verbose_name = "Setting"
        verbose_name_plural = "Settings"
        ordering = ['key']

    def __str__(self):
        """Return the setting key."""
        return self.key


class ContactMessage(models.Model):
    """
    Stores contact form submissions from website visitors.
    
    Records inquiries from potential customers including their
    contact information and message content.
    
    Attributes:
        name (str): Sender's full name.
        email (str): Sender's email address.
        phone (str, optional): Sender's phone number.
        destination (str, optional): Preferred study destination.
        message (str): The inquiry message content.
        created_at (datetime): When the message was submitted.
    
    Example:
        >>> message = ContactMessage.objects.create(
        ...     name='John Smith',
        ...     email='john@example.com',
        ...     destination='Japan',
        ...     message='I am interested in studying in Japan...'
        ... )
    """
    
    name = models.CharField(
        max_length=255,
        help_text="Sender's full name"
    )
    email = models.EmailField(
        help_text="Sender's email address"
    )
    phone = models.CharField(
        max_length=20, 
        blank=True,
        help_text="Optional phone number"
    )
    destination = models.CharField(
        max_length=100, 
        blank=True,
        help_text="Preferred study destination"
    )
    message = models.TextField(
        help_text="The inquiry message"
    )
    is_read = models.BooleanField(
        default=False,
        help_text="Whether the message has been read by admin"
    )
    admin_reply = models.TextField(
        blank=True,
        default='',
        help_text="Admin's reply to this inquiry"
    )
    replied_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the reply was sent"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"
        ordering = ['-created_at']

    def __str__(self):
        """Return sender name and email."""
        return f"{self.name} - {self.email}"


class EmailOTP(models.Model):
    PURPOSE_CHOICES = [
        ('signup', 'Signup Verification'),
        ('password_reset', 'Password Reset'),
    ]

    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def is_expired(self):
        from django.utils import timezone
        import datetime
        return timezone.now() > self.created_at + datetime.timedelta(minutes=10)

    def __str__(self):
        return f"{self.email} - {self.purpose} - {self.otp_code}"
