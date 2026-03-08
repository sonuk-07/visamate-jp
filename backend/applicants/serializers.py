"""
Applicants Serializers Module
=============================
"""

from rest_framework import serializers
from .models import Applicant, Document


class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for Document model.
    Handles file uploads and provides document metadata.
    """
    class Meta:
        model = Document
        fields = '__all__'


class ApplicantSerializer(serializers.ModelSerializer):
    """
    Serializer for Applicant model (used by regular users).

    - fields = '__all__' so payment_status and stripe_payment_intent_id
      are included in every API response automatically.
    - read_only_fields prevents users from writing to admin-only fields.
    """
    documents = DocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Applicant
        fields = '__all__'
        read_only_fields = (
            'user',
            'status',                    # only admin changes this
            'admin_notes',               # only admin writes this
            'payment_status',            # set by payment view / webhook only
            'stripe_payment_intent_id',  # set by payment view only
            'created_at',
            'updated_at',
        )


class AdminApplicantSerializer(serializers.ModelSerializer):
    """
    Serializer for Applicant model (used by admin only).
    Admin can write status, admin_notes — but never payment fields directly.
    """
    documents = DocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Applicant
        fields = '__all__'
        read_only_fields = (
            'user',
            'payment_status',            # changed only via Stripe webhook
            'stripe_payment_intent_id',  # changed only via payment view
            'created_at',
            'updated_at',
        )