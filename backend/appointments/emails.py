from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from datetime import datetime


def send_appointment_confirmation(appointment):
    """Send confirmation email to customer after booking"""
    
    service_labels = {
        'visa_guidance': 'Visa Guidance',
        'university_selection': 'University Selection',
        'application_support': 'Application Support',
        'pre_departure': 'Pre-Departure Prep',
        'general_consultation': 'General Consultation',
    }
    
    service_name = service_labels.get(appointment.service_type, appointment.service_type)
    
    # Format date and time
    if appointment.slot:
        date_str = appointment.slot.date.strftime('%A, %B %d, %Y')
        time_str = f"{appointment.slot.start_time.strftime('%I:%M %p')} - {appointment.slot.end_time.strftime('%I:%M %p')}"
    else:
        date_str = appointment.appointment_date.strftime('%A, %B %d, %Y')
        time_str = appointment.appointment_date.strftime('%I:%M %p')
    
    subject = f'Appointment Confirmation - VisaMate Japan'
    
    # Plain text version
    message = f"""
Dear {appointment.full_name},

Thank you for booking an appointment with VisaMate Japan!

Your appointment details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Service: {service_name}
Date: {date_str}
Time: {time_str}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What's next?
• You will receive a reminder email 24 hours before your appointment
• Please arrive 5 minutes early
• Have any relevant documents ready for discussion

If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Need to reach us?
Email: {settings.EMAIL_HOST_USER}
Website: https://visamate.jp

We look forward to helping you with your study abroad journey!

Best regards,
The VisaMate Japan Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated message. Please do not reply directly to this email.
"""
    
    # HTML version
    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%); padding: 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">✅ Appointment Confirmed</h1>
                            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 16px;">VisaMate Japan</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #333; font-size: 18px; margin: 0 0 25px 0;">Dear <strong>{appointment.full_name}</strong>,</p>
                            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Thank you for booking an appointment with VisaMate Japan! We're excited to help you on your study abroad journey.
                            </p>
                            
                            <!-- Appointment Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #faf8f5 0%, #f5f0ea 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                                <tr>
                                    <td>
                                        <h3 style="color: #1e3a5f; margin: 0 0 20px 0; font-size: 18px;">📅 Appointment Details</h3>
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #888; font-size: 14px; width: 100px;">Service</td>
                                                <td style="color: #1e3a5f; font-size: 16px; font-weight: 600;">{service_name}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #888; font-size: 14px;">Date</td>
                                                <td style="color: #1e3a5f; font-size: 16px; font-weight: 600;">{date_str}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #888; font-size: 14px;">Time</td>
                                                <td style="color: #1e3a5f; font-size: 16px; font-weight: 600;">{time_str}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- What's Next -->
                            <h3 style="color: #1e3a5f; margin: 0 0 15px 0; font-size: 18px;">📋 What's Next?</h3>
                            <ul style="color: #666; font-size: 15px; line-height: 1.8; padding-left: 20px; margin: 0 0 30px 0;">
                                <li>You'll receive a reminder email 24 hours before your appointment</li>
                                <li>Please arrive 5 minutes early</li>
                                <li>Have any relevant documents ready for discussion</li>
                            </ul>
                            
                            <p style="color: #888; font-size: 14px; margin: 0; padding-top: 20px; border-top: 1px solid #eee;">
                                Need to reschedule or cancel? Please contact us at least 24 hours in advance.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1e3a5f; padding: 30px; text-align: center;">
                            <p style="color: rgba(255,255,255,0.9); margin: 0 0 10px 0; font-size: 14px;">
                                Need help? Contact us at <a href="mailto:{settings.EMAIL_HOST_USER}" style="color: #c9a962;">{settings.EMAIL_HOST_USER}</a>
                            </p>
                            <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 12px;">
                                © 2026 VisaMate Japan. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[appointment.email],
        )
        email.attach_alternative(html_message, "text/html")
        email.send(fail_silently=False)
        return True
    except Exception as e:
        print(f"Error sending confirmation email: {e}")
        return False


def send_admin_notification(appointment):
    """Send notification email to admin about new booking"""
    
    service_labels = {
        'visa_guidance': 'Visa Guidance',
        'university_selection': 'University Selection',
        'application_support': 'Application Support',
        'pre_departure': 'Pre-Departure Prep',
        'general_consultation': 'General Consultation',
    }
    
    service_name = service_labels.get(appointment.service_type, appointment.service_type)
    
    # Format date and time
    if appointment.slot:
        date_str = appointment.slot.date.strftime('%A, %B %d, %Y')
        time_str = f"{appointment.slot.start_time.strftime('%I:%M %p')} - {appointment.slot.end_time.strftime('%I:%M %p')}"
    else:
        date_str = appointment.appointment_date.strftime('%A, %B %d, %Y')
        time_str = appointment.appointment_date.strftime('%I:%M %p')
    
    subject = f'🔔 New Appointment: {appointment.full_name} - {service_name}'
    
    message = f"""
New Appointment Booking
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Customer Details:
• Name: {appointment.full_name}
• Email: {appointment.email}
• Phone: {appointment.phone}

Appointment Details:
• Service: {service_name}
• Date: {date_str}
• Time: {time_str}

Message from customer:
{appointment.message or 'No message provided'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Manage this appointment in the admin panel.
"""
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending admin notification: {e}")
        return False
