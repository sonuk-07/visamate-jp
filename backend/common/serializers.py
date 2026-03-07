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
from .models import ContactMessage, UserProfile, UserDocument


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
    phone = serializers.CharField(source='profile.phone', required=False, allow_blank=True, default='')
    date_of_birth = serializers.DateField(source='profile.date_of_birth', required=False, allow_null=True, default=None)
    nationality = serializers.CharField(source='profile.nationality', required=False, allow_blank=True, default='')
    passport_number = serializers.CharField(source='profile.passport_number', required=False, allow_blank=True, default='')
    address = serializers.CharField(source='profile.address', required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff',
                  'phone', 'date_of_birth', 'nationality', 'passport_number', 'address')
        read_only_fields = ('id', 'is_staff')

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if profile_data:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


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
        extra_kwargs = {
            'username': {'required': False},
        }

    def create(self, validated_data):
        """
        Create a new user with hashed password.
        
        Auto-generates username from email if not provided.
        
        Args:
            validated_data (dict): Validated registration data.
        
        Returns:
            User: The newly created user instance.
        """
        if not validated_data.get('username'):
            base = validated_data['email'].split('@')[0]
            username = base
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base}{counter}"
                counter += 1
            validated_data['username'] = username

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
        read_only_fields = ('is_read', 'admin_reply', 'replied_at', 'created_at')


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('phone', 'date_of_birth', 'nationality', 'passport_number', 'address')


class UserDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDocument
        fields = ('id', 'document_type', 'title', 'file', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')
