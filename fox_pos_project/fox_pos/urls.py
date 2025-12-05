from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from django.http import FileResponse
from apps.users import views as user_views
import os

def serve_react_app(request, path=''):
    """Serve React app from staticfiles"""
    if not path or path.endswith('/'):
        path = 'index.html'
    
    file_path = os.path.join(settings.BASE_DIR, 'staticfiles', path)
    
    # Try to find the file in staticfiles/assets if not found in staticfiles root
    if not os.path.exists(file_path) and not path.startswith('assets'):
        assets_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'assets', path)
        if os.path.exists(assets_path):
            file_path = assets_path
    
    if os.path.exists(file_path) and os.path.isfile(file_path):
        if path.endswith('.html'):
            return FileResponse(open(file_path, 'rb'), content_type='text/html')
        elif path.endswith('.js'):
            return FileResponse(open(file_path, 'rb'), content_type='application/javascript')
        elif path.endswith('.css'):
            return FileResponse(open(file_path, 'rb'), content_type='text/css')
        else:
            return FileResponse(open(file_path, 'rb'))
    else:
        # Fallback to index.html for React Router
        index_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'index.html')
        if os.path.exists(index_path):
            return FileResponse(open(index_path, 'rb'), content_type='text/html')
        else:
            from django.http import HttpResponseNotFound
            return HttpResponseNotFound("React app not found")

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
    path('favicon.ico', RedirectView.as_view(url='/static/fox-logo.png', permanent=True)),
    # Serve React static assets - these must come BEFORE the React app catch-all
    path('assets/<path:path>', serve_react_app, name='static_assets'),
    # Serve React app - this must come LAST as a catch-all
    path('app/<path:path>', serve_react_app, name='react_app'),
    path('app/', serve_react_app, name='react_app_root'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)