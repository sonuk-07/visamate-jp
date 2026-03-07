"""
Common Views Module
===================

This module provides REST API endpoints for common functionality
shared across the application, including authentication and contact forms.

Views:
    - RegisterView: User registration endpoint
    - ProfileView: User profile retrieval and update
    - ContactEmailView: Contact form submission

Permissions:
    - Registration: Public (AllowAny)
    - Profile: Authenticated users only
    - Contact: Public (AllowAny)

API Endpoints:
    POST /api/register/         - Register new user
    GET  /api/profile/          - Get current user profile
    PUT  /api/profile/          - Update current user profile
    POST /api/contact/          - Submit contact form
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, ContactMessageSerializer
from .models import ContactMessage


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    
    Creates a new user account with the provided credentials.
    Registration is open to all (no authentication required).
    
    Attributes:
        queryset: All User objects
        permission_classes: AllowAny
        serializer_class: RegisterSerializer
    
    Request Body:
        - username (str): Unique username
        - email (str): Email address
        - password (str): Account password
        - password2 (str): Password confirmation
    
    Returns:
        201: User created successfully with user data
        400: Validation errors (e.g., passwords don't match)
    
    Example:
        POST /api/register/
        {
            "username": "johndoe",
            "email": "john@example.com",
            "password": "securepassword123",
            "password2": "securepassword123"
        }
    """
    
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for user profile management.
    
    Allows authenticated users to retrieve and update their profile.
    The user object is automatically determined from the request.
    
    Attributes:
        serializer_class: UserSerializer
        permission_classes: IsAuthenticated
    
    Methods:
        GET: Retrieve current user's profile
        PUT/PATCH: Update current user's profile
    
    Returns:
        200: User profile data
        401: Not authenticated
    
    Example Response:
        {
            "id": 1,
            "username": "johndoe",
            "email": "john@example.com",
            "first_name": "John",
            "last_name": "Doe"
        }
    """
    
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        """
        Get the current user.
        
        Returns:
            User: The authenticated user making the request.
        """
        return self.request.user


class ContactEmailView(generics.CreateAPIView):
    """
    API endpoint for contact form submissions.
    
    Accepts contact messages from website visitors. No authentication
    required. Messages are stored in the database for admin review.
    
    Attributes:
        queryset: All ContactMessage objects
        serializer_class: ContactMessageSerializer
        permission_classes: AllowAny
    
    Request Body:
        - name (str): Sender's name
        - email (str): Sender's email
        - subject (str): Message subject
        - message (str): Message content
    
    Returns:
        201: Message submitted successfully
        400: Validation errors
    
    Example:
        POST /api/contact/
        {
            "name": "Jane Smith",
            "email": "jane@example.com",
            "subject": "Inquiry about visa services",
            "message": "I would like to know more about..."
        }
    """
    
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = (permissions.AllowAny,)
