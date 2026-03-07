"""
Appointments Views Module
=========================

This module provides REST API endpoints for managing appointment slots
and appointments in the visa consulting application.

ViewSets:
    - AppointmentSlotViewSet: Manages available time slots for appointments
    - AppointmentViewSet: Handles appointment CRUD and user bookings

Permissions:
    - Slot listing: Public (AllowAny)
    - Slot management: Admin only
    - Appointment creation: Public
    - Appointment viewing: Authenticated users (own appointments)

API Endpoints:
    GET  /api/appointment-slots/          - List available slots
    GET  /api/appointment-slots/available/ - List only non-booked slots
    GET  /api/appointment-slots/dates_with_slots/ - Get dates with availability
    POST /api/appointments/               - Create new appointment
    GET  /api/appointments/my_appointments/ - Get user's appointments
    POST /api/appointments/{id}/cancel/   - Cancel an appointment
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Appointment, AppointmentSlot
from .serializers import AppointmentSerializer, AppointmentSlotSerializer
from .emails import send_appointment_confirmation, send_admin_notification


class AppointmentSlotViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing appointment time slots.
    
    This ViewSet provides CRUD operations for appointment slots.
    Public users can view available slots, while only admins can
    create, update, or delete slots.
    
    Attributes:
        queryset: All AppointmentSlot objects
        serializer_class: AppointmentSlotSerializer
    
    Query Parameters:
        date (str): Filter slots by specific date (YYYY-MM-DD)
        service_type (str): Filter by service type
    
    Actions:
        list: Get all active future slots
        available: Get only slots that are not fully booked
        dates_with_slots: Get list of dates with available slots
    
    Example:
        GET /api/appointment-slots/?date=2024-01-15&service_type=consultation
    """
    
    queryset = AppointmentSlot.objects.all()
    serializer_class = AppointmentSlotSerializer
    
    def get_permissions(self):
        """
        Configure permissions based on action.
        
        Returns:
            list: Permission classes for the current action.
                  AllowAny for read actions, IsAdminUser for write actions.
        """
        if self.action in ['list', 'retrieve', 'available', 'dates_with_slots']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        """
        Filter queryset based on query parameters.
        
        Returns only active slots with dates >= today.
        Supports filtering by date and service_type.
        
        Returns:
            QuerySet: Filtered AppointmentSlot objects ordered by date and time.
        """
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
        """
        Get only available (not fully booked) slots.
        
        Filters out slots where current_bookings >= max_bookings.
        
        Args:
            request: HTTP request object.
        
        Returns:
            Response: JSON array of available slot objects.
        
        Example Response:
            [
                {
                    "id": 1,
                    "date": "2024-01-15",
                    "start_time": "09:00",
                    "end_time": "10:00",
                    "service_type": "consultation",
                    "is_available": true
                }
            ]
        """
        slots = self.get_queryset()
        available_slots = [slot for slot in slots if slot.is_available]
        serializer = self.get_serializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dates_with_slots(self, request):
        """
        Get list of dates that have available slots.
        
        Used by the frontend calendar to highlight bookable dates.
        
        Args:
            request: HTTP request object.
        
        Returns:
            Response: JSON array of date strings (YYYY-MM-DD format).
        
        Example Response:
            ["2024-01-15", "2024-01-16", "2024-01-17"]
        """
        slots = AppointmentSlot.objects.filter(
            is_active=True, 
            date__gte=timezone.now().date()
        ).order_by('date').values_list('date', flat=True).distinct()
        return Response(list(slots))


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user appointments.
    
    This ViewSet handles appointment creation, retrieval, and cancellation.
    Users can create appointments without authentication but need to be
    authenticated to view their appointments.
    
    Attributes:
        queryset: All Appointment objects
        serializer_class: AppointmentSerializer
    
    Actions:
        create: Book a new appointment (public)
        list/retrieve: View appointments (authenticated)
        cancel: Cancel an existing appointment
        my_appointments: Get current user's appointments
    
    Email Notifications:
        - Confirmation email sent to user on booking
        - Notification email sent to admin
    
    Example:
        POST /api/appointments/
        {
            "slot": 1,
            "full_name": "John Doe",
            "email": "john@example.com",
            "phone": "+1-555-0123",
            "notes": "First consultation"
        }
    """
    
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    
    def get_permissions(self):
        """
        Configure permissions based on action.
        
        Returns:
            list: IsAuthenticated for all actions.
        """
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        """
        Filter queryset based on user role.
        
        - Staff: See all appointments
        - Authenticated user: See only their appointments
        - Anonymous: Empty queryset
        
        Returns:
            QuerySet: Filtered Appointment objects.
        """
        if self.request.user.is_staff:
            return Appointment.objects.all()
        if self.request.user.is_authenticated:
            return Appointment.objects.filter(user=self.request.user)
        return Appointment.objects.none()

    def perform_create(self, serializer):
        """
        Create a new appointment and send confirmation emails.
        
        If a slot is provided, extracts the appointment date and service
        type from the slot. Sends email notifications after creation.
        
        Args:
            serializer: Validated AppointmentSerializer instance.
        
        Side Effects:
            - Creates Appointment record
            - Sends confirmation email to customer
            - Sends notification email to admin
        """
        slot = serializer.validated_data.get('slot')
        if slot:
            # Set appointment_date from slot
            appointment_date = datetime.combine(slot.date, slot.start_time)
            appointment = serializer.save(
                user=self.request.user,
                appointment_date=timezone.make_aware(appointment_date),
                service_type=slot.service_type
            )
        else:
            appointment = serializer.save(user=self.request.user)
        
        # Send confirmation emails
        send_appointment_confirmation(appointment)
        send_admin_notification(appointment)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel an existing appointment.
        
        Args:
            request: HTTP request object.
            pk: Appointment primary key.
        
        Returns:
            Response: Success message or error if already cancelled.
        
        HTTP Status Codes:
            200: Successfully cancelled
            400: Appointment already cancelled
        """
        appointment = self.get_object()
        if appointment.status == 'cancelled':
            return Response({'error': 'Appointment is already cancelled'}, status=status.HTTP_400_BAD_REQUEST)
        appointment.status = 'cancelled'
        appointment.save()
        return Response({'message': 'Appointment cancelled successfully'})

    @action(detail=False, methods=['get'])
    def my_appointments(self, request):
        """
        Get all appointments for the current authenticated user.
        
        Args:
            request: HTTP request object.
        
        Returns:
            Response: JSON array of appointment objects sorted by date (newest first).
        
        HTTP Status Codes:
            200: Success with appointment list
            401: User not authenticated
        """
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        appointments = Appointment.objects.filter(user=request.user).order_by('-appointment_date')
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update appointment status (admin only).
        
        Args:
            request: HTTP request with 'status' in body.
            pk: Appointment primary key.
        
        Returns:
            Response: Updated appointment data.
        """
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        appointment = self.get_object()
        new_status = request.data.get('status')
        
        valid_statuses = ['pending', 'confirmed', 'cancelled', 'completed']
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = new_status
        if new_status == 'confirmed':
            appointment.is_confirmed = True
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def all_appointments(self, request):
        """
        Get all appointments (admin only).
        
        Returns:
            Response: JSON array of all appointments.
        """
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        appointments = Appointment.objects.all().order_by('-created_at')
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get appointment statistics (admin only).
        
        Returns:
            Response: Statistics about appointments.
        """
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        total = Appointment.objects.count()
        pending = Appointment.objects.filter(status='pending').count()
        confirmed = Appointment.objects.filter(status='confirmed').count()
        completed = Appointment.objects.filter(status='completed').count()
        cancelled = Appointment.objects.filter(status='cancelled').count()
        
        return Response({
            'total': total,
            'pending': pending,
            'confirmed': confirmed,
            'completed': completed,
            'cancelled': cancelled
        })
