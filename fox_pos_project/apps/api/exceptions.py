from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


class BusinessRuleViolation(Exception):
    """Custom exception for business rule violations"""
    def __init__(self, message, error_code='BUSINESS_RULE_VIOLATION'):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)


def custom_exception_handler(exc, context):
    """Custom exception handler for standardized error responses"""
    response = exception_handler(exc, context)
    
    # Handle BusinessRuleViolation
    if isinstance(exc, BusinessRuleViolation):
        return Response({
            'error_code': exc.error_code,
            'message': exc.message,
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Standardize other errors
    if response is not None:
        error_code = 'SERVER_ERROR'
        message = 'حدث خطأ في الخادم'
        
        if response.status_code == 400:
            error_code = 'VALIDATION_ERROR'
            message = 'خطأ في البيانات المدخلة'
        elif response.status_code == 401:
            error_code = 'AUTH_FAILED'
            message = 'فشل في تسجيل الدخول'
        elif response.status_code == 403:
            error_code = 'PERMISSION_DENIED'
            message = 'ليس لديك صلاحية لهذه العملية'
        elif response.status_code == 404:
            error_code = 'NOT_FOUND'
            message = 'العنصر غير موجود'
        
        # Get original message if available
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                message = str(response.data['detail'])
            details = response.data if response.status_code == 400 else None
        else:
            details = None
            if isinstance(response.data, str):
                message = response.data
        
        response.data = {
            'error_code': error_code,
            'message': message,
        }
        
        if details and error_code == 'VALIDATION_ERROR':
            response.data['details'] = details
    
    return response
