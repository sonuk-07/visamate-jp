"""
Common Views Module
===================

This module provides REST API endpoints for common functionality
shared across the application, including authentication and contact forms.

Views:
    - RegisterView: User registration endpoint
    - ProfileView: User profile retrieval and update
    - ContactEmailView: Contact form submission
    - ContactMessageViewSet: Admin CRUD for contact messages

Permissions:
    - Registration: Public (AllowAny)
    - Profile: Authenticated users only
    - Contact: Public (AllowAny)
    - ContactMessageViewSet: Admin only

API Endpoints:
    POST /api/register/         - Register new user
    GET  /api/profile/          - Get current user profile
    PUT  /api/profile/          - Update current user profile
    POST /api/contact/          - Submit contact form
    GET  /api/contact-messages/ - List all contact messages (admin)
"""

from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from .serializers import RegisterSerializer, UserSerializer, ContactMessageSerializer
from .models import ContactMessage, EmailOTP
import os
import httpx
import random


class RegisterView(APIView):
    """Register a new inactive user and send OTP to email."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.is_active = False
        user.save()

        otp_code = f"{random.randint(100000, 999999)}"
        EmailOTP.objects.create(email=user.email, otp_code=otp_code, purpose='signup')

        send_mail(
            subject='VisaMate Japan - Verify Your Email',
            message=f'Your OTP verification code is: {otp_code}\n\nThis code expires in 10 minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {'message': 'OTP sent to your email. Please verify to complete registration.', 'email': user.email},
            status=status.HTTP_201_CREATED,
        )


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


class VerifyOTPView(APIView):
    """Verify OTP for signup email confirmation."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email', '').strip()
        otp_code = request.data.get('otp', '').strip()

        if not email or not otp_code:
            return Response({'error': 'Email and OTP are required.'}, status=status.HTTP_400_BAD_REQUEST)

        otp = EmailOTP.objects.filter(email=email, otp_code=otp_code, purpose='signup', is_used=False).order_by('-created_at').first()
        if not otp:
            return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)
        if otp.is_expired():
            return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        otp.is_used = True
        otp.save()

        user = User.objects.filter(email=email, is_active=False).first()
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.is_active = True
        user.save()

        return Response({'message': 'Email verified successfully. You can now login.'})


class ResendOTPView(APIView):
    """Resend OTP for signup verification."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email, is_active=False).first()
        if not user:
            return Response({'error': 'No pending registration for this email.'}, status=status.HTTP_400_BAD_REQUEST)

        # Invalidate old OTPs
        EmailOTP.objects.filter(email=email, purpose='signup', is_used=False).update(is_used=True)

        otp_code = f"{random.randint(100000, 999999)}"
        EmailOTP.objects.create(email=email, otp_code=otp_code, purpose='signup')

        send_mail(
            subject='VisaMate Japan - Verify Your Email',
            message=f'Your new OTP verification code is: {otp_code}\n\nThis code expires in 10 minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({'message': 'New OTP sent to your email.'})


class ForgotPasswordView(APIView):
    """Send OTP for password reset."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email, is_active=True).first()
        if not user:
            # Don't reveal whether user exists
            return Response({'message': 'If an account exists with this email, an OTP has been sent.'})

        # Invalidate old OTPs
        EmailOTP.objects.filter(email=email, purpose='password_reset', is_used=False).update(is_used=True)

        otp_code = f"{random.randint(100000, 999999)}"
        EmailOTP.objects.create(email=email, otp_code=otp_code, purpose='password_reset')

        send_mail(
            subject='VisaMate Japan - Password Reset OTP',
            message=f'Your password reset OTP is: {otp_code}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({'message': 'If an account exists with this email, an OTP has been sent.'})


class ResetPasswordView(APIView):
    """Verify OTP and set new password."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email', '').strip()
        otp_code = request.data.get('otp', '').strip()
        new_password = request.data.get('new_password', '')

        if not email or not otp_code or not new_password:
            return Response({'error': 'Email, OTP, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({'error': 'Password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        otp = EmailOTP.objects.filter(email=email, otp_code=otp_code, purpose='password_reset', is_used=False).order_by('-created_at').first()
        if not otp:
            return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)
        if otp.is_expired():
            return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        otp.is_used = True
        otp.save()

        user = User.objects.filter(email=email, is_active=True).first()
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.save()

        return Response({'message': 'Password reset successfully. You can now login with your new password.'})


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


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for admin management of contact messages.
    
    Provides full CRUD operations for contact messages.
    Only accessible by admin/staff users.
    
    Actions:
        list: Get all contact messages
        retrieve: Get specific message
        update: Update message (e.g., mark as read)
        destroy: Delete message
        mark_read: Mark message as read
    """
    
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a contact message as read."""
        message = self.get_object()
        message.is_read = True
        message.save()
        return Response({'status': 'marked as read'})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread messages."""
        count = ContactMessage.objects.filter(is_read=False).count()
        return Response({'unread_count': count})


SYSTEM_PROMPT = """You are VisaBot, a friendly and knowledgeable study abroad assistant for VisaMate Japan — a consultancy that helps students study in Japan.

Your expertise includes:
- Japanese student visa requirements and application process
- University selection in Japan (national, private, language schools)
- Scholarship information (MEXT, JASSO, university-specific)
- Cost of living and tuition in Japan
- JLPT requirements and English-taught programs
- Application timelines and deadlines
- Pre-departure preparation

Guidelines:
- Be concise but helpful. Keep responses under 200 words unless detailed info is needed.
- Use relevant emojis sparingly for friendliness.
- If you don't know something specific, recommend they book a consultation with our experts.
- Stay on topic — politely redirect off-topic questions back to study abroad / Japan.
- Respond in the same language the user writes in (English, Japanese, Hindi, etc.)

BOOKING & ENQUIRY:
When the user wants to book an appointment or submit an enquiry, collect the required information conversationally:
- For appointments: full_name, email, phone, service_type (visa_guidance / university_selection / application_support / pre_departure / general_consultation)
- For enquiries: name, email, message, and optionally phone and destination

Once you have ALL required fields, respond with EXACTLY this JSON block on its own line (no other text before/after the JSON):

For appointments:
{"action": "book_appointment", "data": {"full_name": "...", "email": "...", "phone": "...", "service_type": "...", "message": "..."}}

For enquiries:
{"action": "submit_enquiry", "data": {"name": "...", "email": "...", "phone": "...", "message": "...", "destination": "Japan"}}

Ask for missing fields naturally. Do NOT output the JSON until you have all required fields.
"""


class ChatbotView(APIView):
    """Proxy endpoint for Groq-powered chatbot with inline booking/enquiry."""
    permission_classes = [AllowAny]

    def post(self, request):
        messages = request.data.get('messages', [])
        if not messages:
            return Response({'error': 'messages required'}, status=status.HTTP_400_BAD_REQUEST)

        # Handle direct action submissions from frontend
        action = request.data.get('action')
        if action == 'book_appointment':
            return self._book_appointment(request.data.get('data', {}))
        elif action == 'submit_enquiry':
            return self._submit_enquiry(request.data.get('data', {}))

        groq_key = os.getenv('GROQ_API_KEY')
        if not groq_key:
            return Response({'error': 'Chatbot not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        payload = {
            'model': 'llama-3.1-8b-instant',
            'messages': [{'role': 'system', 'content': SYSTEM_PROMPT}] + messages,
            'temperature': 0.7,
            'max_tokens': 512,
        }

        try:
            resp = httpx.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {groq_key}',
                    'Content-Type': 'application/json',
                },
                json=payload,
                timeout=30.0,
            )
            resp.raise_for_status()
            data = resp.json()
            reply = data['choices'][0]['message']['content']
            return Response({'reply': reply})
        except httpx.HTTPStatusError:
            return Response(
                {'error': 'Chat service error'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception:
            return Response(
                {'error': 'Chat service unavailable'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

    def _book_appointment(self, data):
        """Create an appointment from chatbot-collected data."""
        from appointments.models import Appointment
        required = ['full_name', 'email', 'phone', 'service_type']
        missing = [f for f in required if not data.get(f)]
        if missing:
            return Response({'error': f'Missing fields: {", ".join(missing)}'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            appointment = Appointment.objects.create(
                full_name=data['full_name'],
                email=data['email'],
                phone=data['phone'],
                service_type=data['service_type'],
                message=data.get('message', ''),
                status='pending',
            )
            return Response({
                'reply': f"✅ Your appointment has been booked successfully!\n\n📋 **Booking Details:**\n- Name: {appointment.full_name}\n- Service: {appointment.get_service_type_display()}\n- Status: Pending\n\nOur team will confirm your appointment shortly. You'll receive a confirmation email at {appointment.email}. Is there anything else I can help with?",
                'action_completed': 'book_appointment',
                'appointment_id': appointment.id,
            })
        except Exception as e:
            return Response({'error': 'Failed to create appointment'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _submit_enquiry(self, data):
        """Create a contact message from chatbot-collected data."""
        required = ['name', 'email', 'message']
        missing = [f for f in required if not data.get(f)]
        if missing:
            return Response({'error': f'Missing fields: {", ".join(missing)}'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ContactMessage.objects.create(
                name=data['name'],
                email=data['email'],
                phone=data.get('phone', ''),
                message=data['message'],
                destination=data.get('destination', 'Japan'),
            )
            return Response({
                'reply': f"✅ Your enquiry has been submitted successfully!\n\nWe've received your message and our team will get back to you at {data['email']} within 24 hours. Is there anything else you'd like to know?",
                'action_completed': 'submit_enquiry',
            })
        except Exception:
            return Response({'error': 'Failed to submit enquiry'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
