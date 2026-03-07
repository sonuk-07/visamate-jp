"""
Appointments Models Module
==========================

This module defines the database models for the appointment booking system.
It includes models for managing available time slots and customer appointments.

Models:
    - AppointmentSlot: Defines available time slots for appointments
    - Appointment: Stores customer appointment bookings

Usage:
    from appointments.models import AppointmentSlot, Appointment
    
    # Create a time slot
    slot = AppointmentSlot.objects.create(
        date=date(2026, 3, 10),
        start_time=time(9, 0),
        end_time=time(10, 0),
        service_type='visa_guidance'
    )
    
    # Book an appointment
    appointment = Appointment.objects.create(
        slot=slot,
        full_name='John Doe',
        email='john@example.com',
        phone='+81-90-1234-5678'
    )
"""

from django.db import models
from django.contrib.auth.models import User


class AppointmentSlot(models.Model):
    """
    Represents an available time slot for appointments.
    
    This model manages the availability of consultation slots. Each slot
    has a specific date, time range, service type, and maximum booking capacity.
    
    Attributes:
        date (DateField): The date of the appointment slot.
        start_time (TimeField): Start time of the slot.
        end_time (TimeField): End time of the slot.
        service_type (str): Type of service (visa_guidance, university_selection, etc.).
        max_bookings (int): Maximum number of appointments for this slot.
        is_active (bool): Whether the slot is currently available for booking.
        created_at (datetime): Timestamp when the slot was created.
    
    Properties:
        current_bookings: Number of active bookings for this slot.
        is_available: Whether the slot can accept more bookings.
        spots_remaining: Number of spots still available.
    
    Example:
        >>> slot = AppointmentSlot.objects.create(
        ...     date=date(2026, 3, 10),
        ...     start_time=time(9, 0),
        ...     end_time=time(10, 0),
        ...     service_type='visa_guidance',
        ...     max_bookings=2
        ... )
        >>> slot.is_available
        True
        >>> slot.spots_remaining
        2
    """
    
    SERVICE_CHOICES = [
        ('visa_guidance', 'Visa Guidance'),
        ('university_selection', 'University Selection'),
        ('application_support', 'Application Support'),
        ('pre_departure', 'Pre-Departure Prep'),
        ('general_consultation', 'General Consultation'),
    ]
    
    date = models.DateField(
        help_text="Date of the appointment slot"
    )
    start_time = models.TimeField(
        help_text="Start time of the appointment slot"
    )
    end_time = models.TimeField(
        help_text="End time of the appointment slot"
    )
    service_type = models.CharField(
        max_length=100, 
        choices=SERVICE_CHOICES, 
        default='general_consultation',
        help_text="Type of consultation service offered"
    )
    max_bookings = models.IntegerField(
        default=1,
        help_text="Maximum number of bookings allowed for this slot"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this slot is active and available for booking"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'start_time']
        unique_together = ['date', 'start_time', 'service_type']
        verbose_name = "Appointment Slot"
        verbose_name_plural = "Appointment Slots"

    def __str__(self):
        """Return a human-readable representation of the slot."""
        return f"{self.date} {self.start_time}-{self.end_time} ({self.get_service_type_display()})"

    @property
    def current_bookings(self):
        """
        Get the count of active bookings for this slot.
        
        Returns:
            int: Number of appointments with status 'pending' or 'confirmed'.
        """
        return self.appointments.filter(status__in=['pending', 'confirmed']).count()

    @property
    def is_available(self):
        """
        Check if the slot can accept more bookings.
        
        Returns:
            bool: True if slot is active and has capacity, False otherwise.
        """
        return self.is_active and self.current_bookings < self.max_bookings

    @property
    def spots_remaining(self):
        """
        Get the number of available spots in this slot.
        
        Returns:
            int: Number of spots remaining (minimum 0).
        """
        return max(0, self.max_bookings - self.current_bookings)


class Appointment(models.Model):
    """
    Represents a customer appointment booking.
    
    This model stores all appointment bookings made by customers. Each appointment
    is linked to a time slot and contains customer contact information.
    
    Attributes:
        user (User, optional): Linked Django user account if customer is registered.
        slot (AppointmentSlot, optional): The time slot for this appointment.
        full_name (str): Customer's full name.
        email (str): Customer's email address.
        phone (str): Customer's phone number.
        appointment_date (datetime): Date and time of the appointment.
        service_type (str): Type of service requested.
        message (str, optional): Additional message from the customer.
        status (str): Current status (pending, confirmed, cancelled, completed).
        is_confirmed (bool): Legacy field for confirmation status.
        created_at (datetime): When the appointment was created.
        updated_at (datetime): When the appointment was last modified.
    
    Status Flow:
        pending -> confirmed -> completed
                -> cancelled
    
    Example:
        >>> appointment = Appointment.objects.create(
        ...     full_name='John Doe',
        ...     email='john@example.com',
        ...     phone='+81-90-1234-5678',
        ...     service_type='visa_guidance',
        ...     appointment_date=datetime.now()
        ... )
        >>> appointment.status
        'pending'
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Linked user account (optional for guest bookings)"
    )
    slot = models.ForeignKey(
        AppointmentSlot, 
        on_delete=models.CASCADE, 
        related_name='appointments', 
        null=True, 
        blank=True,
        help_text="The time slot for this appointment"
    )
    full_name = models.CharField(
        max_length=200,
        help_text="Customer's full name"
    )
    email = models.EmailField(
        help_text="Customer's email address for confirmations"
    )
    phone = models.CharField(
        max_length=20,
        help_text="Customer's contact phone number"
    )
    appointment_date = models.DateTimeField(
        help_text="Scheduled date and time of the appointment"
    )
    service_type = models.CharField(
        max_length=100,
        help_text="Type of consultation service"
    )
    message = models.TextField(
        blank=True, 
        null=True,
        help_text="Additional notes or questions from the customer"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        help_text="Current status of the appointment"
    )
    is_confirmed = models.BooleanField(
        default=False,
        help_text="Legacy confirmation flag"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Appointment"
        verbose_name_plural = "Appointments"

    def __str__(self):
        """Return a human-readable representation of the appointment."""
        return f"{self.full_name} - {self.appointment_date}"
