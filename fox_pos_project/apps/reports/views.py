from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import DailySalesSummary, InventorySummary, OutstandingDebt, TreasuryBalanceReport, ProfitabilityReport

@login_required
def dashboard(request):
    return render(request, 'reports/dashboard.html')

@login_required
def daily_sales_report(request):
    sales = DailySalesSummary.objects.all().order_by('-invoice_date')
    return render(request, 'reports/daily_sales.html', {'sales': sales, 'title': 'ملخص المبيعات اليومية'})

@login_required
def inventory_report(request):
    inventory = InventorySummary.objects.all().order_by('product_name')
    return render(request, 'reports/inventory.html', {'inventory': inventory, 'title': 'تقرير المخزون'})

@login_required
def debts_report(request):
    debts = OutstandingDebt.objects.all().order_by('due_date')
    return render(request, 'reports/debts.html', {'debts': debts, 'title': 'تقرير الديون المستحقة'})

@login_required
def treasury_report(request):
    treasury = TreasuryBalanceReport.objects.all()
    return render(request, 'reports/treasury.html', {'treasury': treasury, 'title': 'تقرير رصيد الخزينة'})

@login_required
def profitability_report(request):
    profitability = ProfitabilityReport.objects.all().order_by('-invoice_date', 'invoice_number')
    return render(request, 'reports/profitability.html', {'profitability': profitability, 'title': 'تقرير الربحية'})
