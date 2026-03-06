from rest_framework import viewsets, permissions
from .models import Appointment
from .serializers import AppointmentSerializer

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
