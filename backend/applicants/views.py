"""
Applicants Views Module
=======================
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Applicant, Document
from .serializers import ApplicantSerializer, AdminApplicantSerializer, DocumentSerializer
from common.notifications import send_ws_notification


class ApplicantViewSet(viewsets.ModelViewSet):

    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.user.is_staff:
            return AdminApplicantSerializer
        return ApplicantSerializer

    def get_queryset(self):
        qs = Applicant.objects.prefetch_related('documents')
        if self.request.user.is_staff:
            return qs.all()
        if self.request.user.is_authenticated:
            return qs.filter(user=self.request.user)
        return Applicant.objects.none()

    def perform_create(self, serializer):
        import logging
        logger = logging.getLogger("applicants")
        logger.warning(f"Applicant create: user={self.request.user} authenticated={self.request.user.is_authenticated}")
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Admin endpoint — update status, admin_notes, and/or payment_status.

        POST /api/applicants/{id}/update_status/
        Body (all fields optional):
          {
            "status": "reviewing",
            "admin_notes": "Please upload a clearer passport copy.",
            "payment_status": "paid"   ← admin can manually override
          }

        Status transitions are enforced for the application status field.
        Payment status can be freely set by admin (paid / unpaid / refunded).
        """
        if not request.user.is_staff:
            return Response({'error': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)

        application = self.get_object()
        new_status      = request.data.get('status')
        admin_notes     = request.data.get('admin_notes')
        payment_status  = request.data.get('payment_status')

        # ── Validate & apply application status ──────────────────────────────
        if new_status is not None:
            valid_statuses = [c[0] for c in Applicant.STATUS_CHOICES]
            if new_status not in valid_statuses:
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

            # Only enforce transition rules if status is actually changing
            if new_status != application.status:
                VALID_TRANSITIONS = {
                    'applied':        ['reviewing', 'rejected'],
                    'reviewing':      ['interview', 'rejected'],
                    'interview':      ['visa_processing', 'rejected'],
                    'visa_processing':['approved', 'rejected'],
                    'approved':       [],
                    'rejected':       [],
                }
                allowed = VALID_TRANSITIONS.get(application.status, [])
                if new_status not in allowed:
                    return Response(
                        {'error': f'Cannot transition from {application.status} to {new_status}. Allowed: {allowed}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                application.status = new_status

        # ── Apply admin notes ─────────────────────────────────────────────────
        if admin_notes is not None:
            application.admin_notes = admin_notes

        # ── Validate & apply payment status ───────────────────────────────────
        if payment_status is not None:
            valid_payment_statuses = [c[0] for c in Applicant.PAYMENT_STATUS_CHOICES]
            if payment_status not in valid_payment_statuses:
                return Response(
                    {'error': f'Invalid payment_status. Must be one of: {valid_payment_statuses}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            application.payment_status = payment_status

        application.save()

        # ── Real-time WebSocket notification to user ──────────────────────────
        if application.user_id:
            try:
                ws_data = {'application_id': application.id}
                if new_status:
                    ws_data['status'] = new_status
                if payment_status:
                    ws_data['payment_status'] = payment_status
                send_ws_notification(
                    f'user_{application.user_id}',
                    'application_update',
                    ws_data,
                )
            except Exception:
                pass

        return Response(self.get_serializer(application).data)


class DocumentViewSet(viewsets.ModelViewSet):

    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Document.objects.all()
        return Document.objects.filter(applicant__user=self.request.user)

    def perform_create(self, serializer):
        applicant = serializer.validated_data.get('applicant')
        if not self.request.user.is_staff and applicant.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only upload documents for your own applications.')
        serializer.save()