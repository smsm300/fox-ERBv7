from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    path('daily-sales/', views.daily_sales_report, name='daily_sales'),
    path('inventory/', views.inventory_report, name='inventory'),
    path('debts/', views.debts_report, name='debts'),
    path('treasury/', views.treasury_report, name='treasury'),
    path('profitability/', views.profitability_report, name='profitability'),
]
