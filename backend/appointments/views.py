from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Appointment, AppointmentSlot
from .serializers import AppointmentSerializer, AppointmentSlotSerializer
from .emails import send_appointment_confirmation, send_admin_notification


class AppointmentSlotViewSet(viewsets.ModelViewSet):
    queryset = AppointmentSlot.objects.all()
    serializer_class = AppointmentSlotSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'available', 'dates_with_slots']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = AppointmentSlot.objects.filter(is_active=True, date__gte=timezone.now().date())
        
        # Filter by date if provided
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(date=date)
        
        # Filter by service type if provided
        service_type = self.request.query_params.get('service_type')
        if service_type:
            queryset = queryset.filter(service_type=service_type)
        
        return queryset.order_by('date', 'start_time')

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get only available slots (not fully booked)"""
        slots = self.get_queryset()
        available_slots = [slot for slot in slots if slot.is_available]
        serializer = self.get_serializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dates_with_slots(self, request):
        """Get list of dates that have available slots"""
        slots = AppointmentSlot.objects.filter(
            is_active=True, 
            date__gte=timezone.now().date()
        ).order_by('date').values_list('date', flat=True).distinct()
        return Response(list(slots))


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Appointment.objects.all()
        if self.request.user.is_authenticated:
            return Appointment.objects.filter(user=self.request.user)
        return Appointment.objects.none()

    def perform_create(self, serializer):
        slot = serializer.validated_data.get('slot')
        if slot:
            # Set appointment_date from slot
            appointment_date = datetime.combine(slot.date, slot.start_time)
            appointment = serializer.save(
                appointment_date=timezone.make_aware(appointment_date),
                service_type=slot.service_type
            )
        else:
            appointment = serializer.save()
        
        # Send confirmation emails
        send_appointment_confirmation(appointment)
        send_admin_notification(appointment)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        appointment = self.get_object()
        if appointment.status == 'cancelled':
            return Response({'error': 'Appointment is already cancelled'}, status=status.HTTP_400_BAD_REQUEST)
        appointment.status = 'cancelled'
        appointment.save()
        return Response({'message': 'Appointment cancelled successfully'})

    @action(detail=False, methods=['get'])
    def my_appointments(self, request):
        """Get current user's appointments"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        appointments = Appointment.objects.filter(user=request.user).order_by('-appointment_date')
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
