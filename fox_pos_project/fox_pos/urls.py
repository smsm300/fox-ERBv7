from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from apps.users import views as user_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.api.urls')),  # API endpoints
    path('', include('apps.users.urls')),
    path('customers/', include('apps.customers.urls')),
    path('suppliers/', include('apps.suppliers.urls')),
    path('products/', include('apps.products.urls')),
    path('sales/', include('apps.sales.urls')),
    path('purchases/', include('apps.purchases.urls')),
    path('inventory/', include('apps.inventory.urls')),
    path('treasury/', include('apps.treasury.urls')),
    path('reports/', include('apps.reports.urls')),
    path('quotations/', include('apps.quotations.urls')),
    path('favicon.ico', RedirectView.as_view(url='/static/images/favicon.ico', permanent=True)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
