"""
Applicants Models Module
========================
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator


class Applicant(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('reviewing', 'Reviewing'),
        ('interview', 'Interview'),
        ('visa_processing', 'Visa Processing'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
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
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    destination_country = models.CharField(max_length=20, choices=COUNTRY_CHOICES, default='japan')
    visa_type = models.CharField(max_length=30, choices=VISA_TYPE_CHOICES, default='student_visa')
    education_level = models.CharField(max_length=20, choices=EDUCATION_CHOICES, blank=True, default='')
    preferred_course = models.CharField(max_length=200, blank=True, default='')
    preferred_start_date = models.DateField(null=True, blank=True)
    message = models.TextField(blank=True, default='')
    passport_number = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    admin_notes = models.TextField(blank=True, default='')

    # ── Payment fields ──────────────────────────────────────────────────────
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='unpaid',
        help_text="Whether the processing fee has been paid",
    )
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Stripe PaymentIntent ID — used to avoid duplicate charges",
    )
    # ────────────────────────────────────────────────────────────────────────

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Applicant"
        verbose_name_plural = "Applicants"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Document(models.Model):
    applicant = models.ForeignKey(
        Applicant,
        related_name='documents',
        on_delete=models.CASCADE,
    )
    title = models.CharField(max_length=255)
    file = models.FileField(
        upload_to='documents/',
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']),
        ],
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Document"
        verbose_name_plural = "Documents"
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.title} - {self.applicant}"