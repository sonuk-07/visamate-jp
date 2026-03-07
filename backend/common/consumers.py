"""
WebSocket Consumer for Real-Time Notifications
===============================================

Handles WebSocket connections for authenticated users.
Each user joins a personal notification group (user_{id}).
Admin users also join the admin_notifications group.

Event types sent to clients:
  - message_update: Admin replied to a contact message
  - appointment_update: Appointment status changed
  - application_update: Application status changed
  - new_appointment: New appointment booked (admin only)
  - new_enquiry: New contact enquiry submitted (admin only)
"""

import json
from channels.generic.websocket import AsyncJsonWebSocketConsumer


class NotificationConsumer(AsyncJsonWebSocketConsumer):
    """WebSocket consumer that delivers real-time notifications to users."""

    async def connect(self):
        self.user = self.scope.get('user')
        
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        
        # Join user-specific group
        self.user_group = f'user_{self.user.id}'
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        
        # Admin users also join admin notifications group
        if self.user.is_staff:
            await self.channel_layer.group_add('admin_notifications', self.channel_name)
        
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group'):
            await self.channel_layer.group_discard(self.user_group, self.channel_name)
        
        if hasattr(self, 'user') and self.user and getattr(self.user, 'is_staff', False):
            await self.channel_layer.group_discard('admin_notifications', self.channel_name)

    # --- Event handlers (called by channel layer group_send) ---

    async def notification(self, event):
        """Send notification event to the WebSocket client."""
        await self.send_json({
            'type': event['notification_type'],
            'data': event.get('data', {}),
        })
