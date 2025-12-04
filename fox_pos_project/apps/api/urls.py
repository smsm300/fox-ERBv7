from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .auth import CustomTokenObtainPairView, LogoutView
from .views import (ProductViewSet, CustomerViewSet, SupplierViewSet, ShiftViewSet, 
                    TransactionViewSet, QuotationViewSet, SettingsViewSet, UserViewSet,
                    ActivityLogViewSet, ReportsViewSet, SystemViewSet)

router = DefaultRouter()

# Register ViewSets
router.register(r'products', ProductViewSet, basename='product')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'shifts', ShiftViewSet, basename='shift')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'quotations', QuotationViewSet, basename='quotation')
router.register(r'settings', SettingsViewSet, basename='settings')
router.register(r'users', UserViewSet, basename='user')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-log')
router.register(r'reports', ReportsViewSet, basename='reports')
router.register(r'system', SystemViewSet, basename='system')

urlpatterns = [
    # Auth endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    
    # API routes
    path('', include(router.urls)),
]
