"""
Applicants Views Module
=======================

This module provides REST API endpoints for managing applicants
and their documents in the visa consulting application.

ViewSets:
    - ApplicantViewSet: CRUD operations for applicant records
    - DocumentViewSet: Manage applicant documents

Permissions:
    - Applicant listing/creation: Public (AllowAny)
    - Applicant updates: Authenticated users (own records)
    - Documents: Authenticated users (own documents)

API Endpoints:
    GET    /api/applicants/      - List applicants
    POST   /api/applicants/      - Create new applicant
    GET    /api/applicants/{id}/ - Get applicant details
    PUT    /api/applicants/{id}/ - Update applicant
    DELETE /api/applicants/{id}/ - Delete applicant
    
    GET    /api/documents/       - List user's documents
    POST   /api/documents/       - Upload new document
    GET    /api/documents/{id}/  - Get document details
    DELETE /api/documents/{id}/  - Delete document
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Applicant, Document
from .serializers import ApplicantSerializer, AdminApplicantSerializer, DocumentSerializer


class ApplicantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing visa applicants.
    
    Provides CRUD operations for applicant records. Public users can
    create and view applicants, while authenticated users can only
    access their own records (unless staff).
    
    Attributes:
        queryset: All Applicant objects
        serializer_class: ApplicantSerializer
    
    Permissions:
        - create, list, retrieve: AllowAny
        - update, partial_update, destroy: IsAuthenticated
    
    Example:
        POST /api/applicants/
        {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "phone": "+1-555-0123"
        }
    """
    
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer
    
    def get_permissions(self):
        """
        Configure permissions based on action.
        
        Returns:
            list: AllowAny for create, IsAuthenticated for all others.
        """
        if self.action == 'create':
             return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.user.is_staff:
            return AdminApplicantSerializer
        return ApplicantSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return Applicant.objects.all()
        if self.request.user.is_authenticated:
            return Applicant.objects.filter(user=self.request.user)
        return Applicant.objects.none()

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)
        application = self.get_object()
        new_status = request.data.get('status')
        admin_notes = request.data.get('admin_notes')
        valid_statuses = [c[0] for c in Applicant.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        application.status = new_status
        if admin_notes is not None:
            application.admin_notes = admin_notes
        application.save()
        serializer = self.get_serializer(application)
        return Response(serializer.data)


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing applicant documents.
    
    Allows authenticated users to upload and manage their documents
    (e.g., passport copies, transcripts). Only staff can see all
    documents; regular users see only their own.
    
    Attributes:
        queryset: All Document objects
        serializer_class: DocumentSerializer
        permission_classes: [IsAuthenticated]
    
    Example:
        POST /api/documents/
        Content-Type: multipart/form-data
        {
            "applicant": 1,
            "title": "Passport Copy",
            "file": <file>
        }
    """
    
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter queryset based on user role.
        
        - Staff: See all documents
        - Regular user: See only their documents
        
        Returns:
            QuerySet: Filtered Document objects.
        """
        if self.request.user.is_staff:
            return Document.objects.all()
        return Document.objects.filter(applicant__user=self.request.user)
