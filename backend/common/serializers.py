from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import ContactMessage, UserProfile, UserDocument


class EmailOrUsernameTokenSerializer(TokenObtainPairSerializer):
    """Allow login with either username or email."""

    def validate(self, attrs):
        username_field = attrs.get('username', '')
        if '@' in username_field:
            user = User.objects.filter(email=username_field).first()
            if user:
                attrs['username'] = user.username
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
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'username': {'required': False},
        }

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    def validate_email(self, value):
        existing = User.objects.filter(email=value).first()
        if existing:
            if not existing.is_active:
                raise serializers.ValidationError(
                    'This email is already registered but not verified. '
                    'Please use the Resend OTP option to complete verification.'
                )
            raise serializers.ValidationError(
                'An account with this email already exists. Please log in instead.'
            )
        return value

    def create(self, validated_data):
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
        UserProfile.objects.get_or_create(user=user)
        return user


class ContactMessageSerializer(serializers.ModelSerializer):
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