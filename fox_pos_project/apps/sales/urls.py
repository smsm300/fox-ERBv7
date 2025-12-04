from django.urls import path
from . import views

app_name = 'sales'

urlpatterns = [
    path('', views.pos_view, name='pos'),
    path('pos/', views.pos_view, name='pos_view'), # Alias
    path('api/products/', views.api_products, name='api_products'),
    path('api/invoice/create/', views.api_create_invoice, name='api_create_invoice'),
    
    # Returns
    path('returns/', views.sales_return_list, name='return_list'),
    path('returns/create/', views.sales_return_create, name='return_create'),
]
