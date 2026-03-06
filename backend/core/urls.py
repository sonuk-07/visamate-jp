from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from applicants.views import ApplicantViewSet, DocumentViewSet
from appointments.views import AppointmentViewSet
from common.views import ContactEmailView, RegisterView, ProfileView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'applicants', ApplicantViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'appointments', AppointmentViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/contact/', ContactEmailView.as_view()),
    path('api/register/', RegisterView.as_view()),
    path('api/profile/', ProfileView.as_view()),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls')),
]
