from rest_framework import viewsets, permissions
from .models import Applicant, Document
from .serializers import ApplicantSerializer, DocumentSerializer

class ApplicantViewSet(viewsets.ModelViewSet):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve']:
             return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Applicant.objects.all()
        if self.request.user.is_authenticated:
            return Applicant.objects.filter(user=self.request.user)
        return Applicant.objects.none()

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Document.objects.all()
        return Document.objects.filter(applicant__user=self.request.user)
