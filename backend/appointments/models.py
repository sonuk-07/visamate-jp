from django.db import models
from django.contrib.auth.models import User

class AppointmentSlot(models.Model):
    """Available appointment time slots"""
    SERVICE_CHOICES = [
        ('visa_guidance', 'Visa Guidance'),
        ('university_selection', 'University Selection'),
        ('application_support', 'Application Support'),
        ('pre_departure', 'Pre-Departure Prep'),
        ('general_consultation', 'General Consultation'),
    ]
    
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    service_type = models.CharField(max_length=100, choices=SERVICE_CHOICES, default='general_consultation')
    max_bookings = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'start_time']
        unique_together = ['date', 'start_time', 'service_type']

    def __str__(self):
        return f"{self.date} {self.start_time}-{self.end_time} ({self.get_service_type_display()})"

    @property
    def current_bookings(self):
        return self.appointments.filter(status__in=['pending', 'confirmed']).count()

    @property
    def is_available(self):
        return self.is_active and self.current_bookings < self.max_bookings

    @property
    def spots_remaining(self):
        return max(0, self.max_bookings - self.current_bookings)


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    slot = models.ForeignKey(AppointmentSlot, on_delete=models.CASCADE, related_name='appointments', null=True, blank=True)
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    appointment_date = models.DateTimeField()
    service_type = models.CharField(max_length=100)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.appointment_date}"
