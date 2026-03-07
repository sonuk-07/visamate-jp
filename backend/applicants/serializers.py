"""
Applicants Serializers Module
=============================

This module provides serializers for converting applicant-related
models to/from JSON for REST API communication.

Serializers:
    - DocumentSerializer: Serializes applicant documents
    - ApplicantSerializer: Serializes applicant records with nested documents

Usage:
    from applicants.serializers import ApplicantSerializer
    
    # Serialize an applicant with documents
    serializer = ApplicantSerializer(applicant)
    json_data = serializer.data
"""

from rest_framework import serializers
from .models import Applicant, Document


class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for Document model.
    
    Handles file uploads and provides document metadata.
    
    Fields:
        id (int): Document primary key
        applicant (int): Applicant foreign key
        title (str): Document title/description
        file (file): Uploaded file
        uploaded_at (datetime): Upload timestamp
    
    Example Output:
        {
            "id": 1,
            "applicant": 1,
            "title": "Passport Copy",
            "file": "/documents/passport_copy.pdf",
            "uploaded_at": "2024-01-15T10:30:00Z"
        }
    """
    
    class Meta:
        model = Document
        fields = '__all__'


class ApplicantSerializer(serializers.ModelSerializer):
    """
    Serializer for Applicant model.
    
    Provides complete applicant information with nested documents.
    
    Fields:
        id (int): Applicant primary key
        user (int): Linked Django user ID (optional)
        first_name (str): Applicant's first name
        last_name (str): Applicant's last name
        email (str): Unique email address
        phone (str): Contact phone number
        passport_number (str): Passport number (optional)
        status (str): Application status code
        documents (list): Nested list of DocumentSerializer objects
        created_at (datetime): Record creation timestamp
        updated_at (datetime): Record last update timestamp
    
    Example Output:
        {
            "id": 1,
            "user": null,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "phone": "+1-555-0123",
            "passport_number": "AB1234567",
            "status": "applied",
            "documents": [
                {
                    "id": 1,
                    "title": "Passport Copy",
                    "file": "/documents/passport.pdf"
                }
            ],
            "created_at": "2024-01-15T10:00:00Z",
            "updated_at": "2024-01-15T10:00:00Z"
        }
    """
    
    documents = DocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Applicant
        fields = '__all__'
