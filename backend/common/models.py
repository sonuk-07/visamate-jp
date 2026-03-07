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
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"
        ordering = ['-created_at']

    def __str__(self):
        """Return sender name and email."""
        return f"{self.name} - {self.email}"
