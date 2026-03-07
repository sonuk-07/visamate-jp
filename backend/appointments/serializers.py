from rest_framework import serializers
from .models import Appointment, AppointmentSlot


class AppointmentSlotSerializer(serializers.ModelSerializer):
    is_available = serializers.ReadOnlyField()
    spots_remaining = serializers.ReadOnlyField()
    current_bookings = serializers.ReadOnlyField()
    service_type_display = serializers.CharField(source='get_service_type_display', read_only=True)
    
    class Meta:
        model = AppointmentSlot
        fields = ['id', 'date', 'start_time', 'end_time', 'service_type', 'service_type_display',
                  'max_bookings', 'is_active', 'is_available', 'spots_remaining', 'current_bookings']


class AppointmentSerializer(serializers.ModelSerializer):
    slot_details = AppointmentSlotSerializer(source='slot', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Appointment
        fields = ['id', 'user', 'slot', 'slot_details', 'full_name', 'email', 'phone',
                  'appointment_date', 'service_type', 'message', 'status', 'status_display',
                  'is_confirmed', 'created_at', 'updated_at']
        read_only_fields = ['status', 'is_confirmed', 'created_at', 'updated_at']

    def validate(self, data):
        slot = data.get('slot')
        if slot and not slot.is_available:
            raise serializers.ValidationError({"slot": "This time slot is no longer available."})
        return data
