"""
Applicants Models Module
========================

This module defines the database models for managing visa applicants
and their documents throughout the application process.

Models:
    - Applicant: Stores applicant personal information and application status
    - Document: Stores uploaded documents associated with applicants

Status Flow:
    applied -> reviewing -> interview -> visa_processing -> approved/rejected

Usage:
    from applicants.models import Applicant, Document
    
    # Create an applicant
    applicant = Applicant.objects.create(
        first_name='John',
        last_name='Doe',
        email='john@example.com',
        phone='+81-90-1234-5678'
    )
    
    # Upload a document
    document = Document.objects.create(
        applicant=applicant,
        title='Passport Copy',
        file=uploaded_file
    )
"""

from django.db import models
from django.contrib.auth.models import User


class Applicant(models.Model):
    """
    Represents a visa applicant in the system.
    
    This model stores personal information and tracks the application status
    of individuals applying for study abroad programs.
    
    Attributes:
        user (User, optional): Linked Django user account.
        first_name (str): Applicant's first name.
        last_name (str): Applicant's last name.
        email (str): Unique email address.
        phone (str): Contact phone number.
        passport_number (str, optional): Passport number for visa processing.
        status (str): Current application status.
        created_at (datetime): When the record was created.
        updated_at (datetime): When the record was last modified.
    
    Status Choices:
        - applied: Initial application submitted
        - reviewing: Application under review
        - interview: Interview scheduled/completed
        - visa_processing: Visa application in progress
        - approved: Application approved
        - rejected: Application rejected
    
    Example:
        >>> applicant = Applicant.objects.create(
        ...     first_name='Jane',
        ...     last_name='Smith',
        ...     email='jane@example.com',
        ...     phone='+1-555-0123'
        ... )
        >>> applicant.status
        'applied'
    """
    
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('reviewing', 'Reviewing'),
        ('interview', 'Interview'),
        ('visa_processing', 'Visa Processing'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    COUNTRY_CHOICES = [
        ('japan', 'Japan'),
        ('australia', 'Australia'),
    ]

    VISA_TYPE_CHOICES = [
        ('student_visa', 'Student Visa'),
        ('work_visa', 'Work Visa'),
        ('skilled_worker', 'Specified Skilled Worker'),
        ('skilled_migration', 'Skilled Migration'),
        ('working_holiday', 'Working Holiday'),
    ]

    EDUCATION_CHOICES = [
        ('high_school', 'High School'),
        ('bachelors', "Bachelor's Degree"),
        ('masters', "Master's Degree"),
        ('phd', 'PhD'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='applications',
        help_text="Linked user account for registered applicants"
    )
    first_name = models.CharField(
        max_length=100,
        help_text="Applicant's first name"
    )
    last_name = models.CharField(
        max_length=100,
        help_text="Applicant's last name"
    )
    email = models.EmailField(
        help_text="Email address for communication"
    )
    phone = models.CharField(
        max_length=20,
        help_text="Contact phone number"
    )
    destination_country = models.CharField(
        max_length=20,
        choices=COUNTRY_CHOICES,
        default='japan',
        help_text="Destination country"
    )
    visa_type = models.CharField(
        max_length=30,
        choices=VISA_TYPE_CHOICES,
        default='student_visa',
        help_text="Type of visa being applied for"
    )
    education_level = models.CharField(
        max_length=20,
        choices=EDUCATION_CHOICES,
        blank=True,
        default='',
        help_text="Current education level"
    )
    preferred_start_date = models.DateField(
        null=True,
        blank=True,
        help_text="Preferred program start date"
    )
    message = models.TextField(
        blank=True,
        default='',
        help_text="Additional notes or message"
    )
    passport_number = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        help_text="Passport number for visa processing"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='applied',
        help_text="Current status of the application"
    )
    admin_notes = models.TextField(
        blank=True,
        default='',
        help_text="Admin notes visible to applicant"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Applicant"
        verbose_name_plural = "Applicants"
        ordering = ['-created_at']

    def __str__(self):
        """Return the applicant's full name."""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        """
        Get the applicant's full name.
        
        Returns:
            str: First name and last name combined.
        """
        return f"{self.first_name} {self.last_name}"


class Document(models.Model):
    """
    Represents an uploaded document for an applicant.
    
    This model stores files uploaded by applicants as part of their
    visa application process (e.g., passport copies, transcripts).
    
    Attributes:
        applicant (Applicant): The applicant who owns this document.
        title (str): Document title/description.
        file (FileField): The uploaded file.
        uploaded_at (datetime): When the document was uploaded.
    
    Example:
        >>> document = Document.objects.create(
        ...     applicant=applicant,
        ...     title='University Transcript',
        ...     file=transcript_file
        ... )
    """
    
    applicant = models.ForeignKey(
        Applicant, 
        related_name='documents', 
        on_delete=models.CASCADE,
        help_text="The applicant this document belongs to"
    )
    title = models.CharField(
        max_length=255,
        help_text="Document title or description"
    )
    file = models.FileField(
        upload_to='documents/',
        help_text="The uploaded file"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Document"
        verbose_name_plural = "Documents"
        ordering = ['-uploaded_at']

    def __str__(self):
        """Return document title with applicant name."""
        return f"{self.title} - {self.applicant}"
