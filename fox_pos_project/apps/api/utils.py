"""
Utility functions for the API app
"""
from .models import ActivityLog


def log_activity(user, action, details):
    """
    Log an activity to the ActivityLog model
    
    Args:
        user: User instance or None
        action: Action description (e.g., 'عملية بيع', 'عملية شراء')
        details: Detailed description of the activity
    """
    user_name = user.username if user else 'نظام'
    
    ActivityLog.objects.create(
        user=user,
        user_name=user_name,
        action=action,
        details=details
    )
