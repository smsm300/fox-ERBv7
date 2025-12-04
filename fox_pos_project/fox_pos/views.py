from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def dashboard(request):
    context = {
        'sales_today': 0,
        'customers_count': 0,
        'products_count': 0,
        'treasury_balance': 0,
    }
    return render(request, 'dashboard.html', context)
