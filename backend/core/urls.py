from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from applicants.views import ApplicantViewSet, DocumentViewSet
from appointments.views import AppointmentViewSet, AppointmentSlotViewSet
from common.views import ContactEmailView, RegisterView, ProfileView, ContactMessageViewSet, ChatbotView, VerifyOTPView, ResendOTPView, ForgotPasswordView, ResetPasswordView, ChangePasswordView, MyMessagesView, UserDocumentViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from common.serializers import EmailOrUsernameTokenSerializer
from core.views_payment import create_payment_intent, confirm_payment, stripe_webhook

router = DefaultRouter()
router.register(r'applicants', ApplicantViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'appointment-slots', AppointmentSlotViewSet)
router.register(r'contact-messages', ContactMessageViewSet)
router.register(r'user-documents', UserDocumentViewSet, basename='user-documents')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/contact/', ContactEmailView.as_view()),
    path('api/register/', RegisterView.as_view()),
    path('api/verify-otp/', VerifyOTPView.as_view()),
    path('api/resend-otp/', ResendOTPView.as_view()),
    path('api/forgot-password/', ForgotPasswordView.as_view()),
    path('api/reset-password/', ResetPasswordView.as_view()),
    path('api/profile/', ProfileView.as_view()),
    path('api/change-password/', ChangePasswordView.as_view()),
    path('api/token/', TokenObtainPairView.as_view(serializer_class=EmailOrUsernameTokenSerializer), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/chat/', ChatbotView.as_view()),
    path('api/my-messages/', MyMessagesView.as_view()),
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls')),
    path('api/create-payment-intent/', create_payment_intent, name='create_payment_intent'),
    path('api/create-payment-intent/', create_payment_intent, name='create_payment_intent'),
    path('api/confirm-payment/', confirm_payment, name='confirm_payment'),          # ← NEW
    path('api/stripe-webhook/', stripe_webhook, name='stripe_webhook'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
