"""
Common Serializers Module
=========================

This module provides serializers for common functionality including
user authentication, profile management, and contact forms.

Serializers:
    - UserSerializer: Serializes user profile data
    - RegisterSerializer: Handles user registration with password
    - ContactMessageSerializer: Serializes contact form submissions

Usage:
    from common.serializers import RegisterSerializer
    
    # Register a new user
    serializer = RegisterSerializer(data=registration_data)
    if serializer.is_valid():
        user = serializer.save()
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import ContactMessage


class EmailOrUsernameTokenSerializer(TokenObtainPairSerializer):
    """Allow login with either username or email."""

    def validate(self, attrs):
        username_field = attrs.get('username', '')
        if '@' in username_field:
            try:
                user = User.objects.get(email=username_field)
                attrs['username'] = user.username
            except User.DoesNotExist:
                pass  # let parent raise invalid credentials
        return super().validate(attrs)


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model (profile view).
    
    Provides read access to user profile information.
    Password field is excluded for security.
    
    Fields:
        id (int): User primary key
        username (str): Unique username
        email (str): Email address
        first_name (str): User's first name
        last_name (str): User's last name
    
    Example Output:
        {
            "id": 1,
            "username": "johndoe",
            "email": "john@example.com",
            "first_name": "John",
            "last_name": "Doe"
        }
    """
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff')


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    
    Handles new user creation with password hashing.
    Password is write-only and never returned in responses.
    
    Fields:
        id (int): Generated user ID (read-only)
        username (str): Required unique username
        password (str): Required password (write-only)
        email (str): Email address
        first_name (str): First name (optional)
        last_name (str): Last name (optional)
    
    Example Input:
        {
            "username": "johndoe",
            "password": "securepassword123",
            "email": "john@example.com",
            "first_name": "John",
            "last_name": "Doe"
        }
    """
    
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'first_name', 'last_name')

    def create(self, validated_data):
        """
        Create a new user with hashed password.
        
        Uses Django's create_user method to properly hash the password.
        
        Args:
            validated_data (dict): Validated registration data.
        
        Returns:
            User: The newly created user instance.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class ContactMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for ContactMessage model.
    
    Handles contact form submissions from website visitors.
    
    Fields:
        id (int): Message primary key
        name (str): Sender's name
        email (str): Sender's email address
        subject (str): Message subject
        message (str): Message content
        created_at (datetime): Submission timestamp
    
    Example Input:
        {
            "name": "Jane Smith",
            "email": "jane@example.com",
            "subject": "Inquiry about visa services",
            "message": "I would like to know more about..."
        }
    """
    
    class Meta:
        model = ContactMessage
        fields = '__all__'
