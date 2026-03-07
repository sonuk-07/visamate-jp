"""
Appointments Serializers Module
===============================

This module provides serializers for converting appointment-related
models to/from JSON for REST API communication.

Serializers:
    - AppointmentSlotSerializer: Serializes appointment time slots
    - AppointmentSerializer: Serializes appointment booking records

Usage:
    from appointments.serializers import AppointmentSerializer
    
    # Serialize an appointment
    serializer = AppointmentSerializer(appointment)
    json_data = serializer.data
    
    # Create appointment from data
    serializer = AppointmentSerializer(data=request.data)
    if serializer.is_valid():
        appointment = serializer.save()
"""

from rest_framework import serializers
from .models import Appointment, AppointmentSlot


class AppointmentSlotSerializer(serializers.ModelSerializer):
    """
    Serializer for AppointmentSlot model.
    
    Converts appointment slots to JSON with computed availability fields.
    Read-only fields provide real-time booking status.
    
    Fields:
        id (int): Slot primary key
        date (date): Appointment date
        start_time (time): Start time of slot
        end_time (time): End time of slot
        service_type (str): Type code (e.g., 'visa_guidance')
        service_type_display (str): Human-readable service name
        max_bookings (int): Maximum allowed bookings
        is_active (bool): Whether slot accepts bookings
        is_available (bool): Computed - has open spots
        spots_remaining (int): Computed - available booking count
        current_bookings (int): Computed - current booking count
    
    Example Output:
        {
            "id": 1,
            "date": "2024-01-15",
            "start_time": "09:00:00",
            "end_time": "10:00:00",
            "service_type": "consultation",
            "service_type_display": "General Consultation",
            "max_bookings": 3,
            "is_active": true,
            "is_available": true,
            "spots_remaining": 2,
            "current_bookings": 1
        }
    """
    
    is_available = serializers.ReadOnlyField()
    spots_remaining = serializers.ReadOnlyField()
    current_bookings = serializers.ReadOnlyField()
    service_type_display = serializers.CharField(source='get_service_type_display', read_only=True)
    
    class Meta:
        model = AppointmentSlot
        fields = ['id', 'date', 'start_time', 'end_time', 'service_type', 'service_type_display',
                  'max_bookings', 'is_active', 'is_available', 'spots_remaining', 'current_bookings']


class AppointmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Appointment model.
    
    Handles appointment creation with slot validation and provides
    nested slot details in responses.
    
    Fields:
        id (int): Appointment primary key
        user (int): Associated user ID (optional)
        slot (int): AppointmentSlot foreign key
        slot_details (object): Nested AppointmentSlotSerializer (read-only)
        full_name (str): Customer's full name
        email (str): Customer's email address
        phone (str): Customer's phone number
        appointment_date (datetime): Scheduled appointment time
        service_type (str): Type of service booked
        message (str): Optional notes from customer
        status (str): Current status code
        status_display (str): Human-readable status
        is_confirmed (bool): Whether booking is confirmed
        created_at (datetime): Record creation timestamp
        updated_at (datetime): Record last update timestamp
    
    Validation:
        - If slot provided, validates slot is still available
        - Raises ValidationError if slot is fully booked
    
    Example Input:
        {
            "slot": 1,
            "full_name": "John Doe",
            "email": "john@example.com",
            "phone": "+1-555-0123",
            "message": "First consultation"
        }
    """
    
    slot_details = AppointmentSlotSerializer(source='slot', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Appointment
        fields = ['id', 'user', 'slot', 'slot_details', 'full_name', 'email', 'phone',
                  'appointment_date', 'service_type', 'message', 'status', 'status_display',
                  'is_confirmed', 'created_at', 'updated_at']
        read_only_fields = ['status', 'is_confirmed', 'created_at', 'updated_at']

    def validate(self, data):
        """
        Validate the appointment data.
        
        Ensures the selected slot is still available for booking.
        
        Args:
            data (dict): Validated input data.
        
        Returns:
            dict: Validated data if slot is available.
        
        Raises:
            ValidationError: If the slot is no longer available.
        """
        slot = data.get('slot')
        if slot and not slot.is_available:
            raise serializers.ValidationError({"slot": "This time slot is no longer available."})
        return data
