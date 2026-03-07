"""
WebSocket Notification Utility
==============================

Helper function to send real-time notifications to users via Django Channels.
"""

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def send_ws_notification(group_name, notification_type, data=None):
    """
    Send a WebSocket notification to a channel group.
    
    Args:
        group_name: Channel group name (e.g., 'user_5', 'admin_notifications')
        notification_type: Type of notification (e.g., 'message_update')
        data: Optional dict of data to include in the notification
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'notification',
            'notification_type': notification_type,
            'data': data or {},
        }
    )
