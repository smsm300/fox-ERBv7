from django.urls import path
from . import views

app_name = 'quotations'

urlpatterns = [
    path('', views.quotation_list, name='quotation_list'),
    path('create/', views.quotation_create, name='quotation_create'),
    path('<int:pk>/', views.quotation_detail, name='quotation_detail'),
    path('<int:pk>/print/', views.quotation_print, name='quotation_print'),
]
