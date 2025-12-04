from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Sum, Case, When, DecimalField
from .models import Treasury
from .forms import TreasuryForm

@login_required
def treasury_list(request):
    transactions = Treasury.objects.all().order_by('-created_at')
    
    # Calculate balance
    balance = Treasury.objects.aggregate(
        total_income=Sum(Case(
            When(transaction_type__in=['income', 'opening_balance'], then='amount'),
            default=0,
            output_field=DecimalField()
        )),
        total_expense=Sum(Case(
            When(transaction_type='expense', then='amount'),
            default=0,
            output_field=DecimalField()
        ))
    )
    
    total_income = balance['total_income'] or 0
    total_expense = balance['total_expense'] or 0
    current_balance = total_income - total_expense
    
    return render(request, 'treasury/treasury_list.html', {
        'transactions': transactions,
        'total_income': total_income,
        'total_expense': total_expense,
        'current_balance': current_balance
    })

@login_required
def treasury_create(request):
    if request.method == 'POST':
        form = TreasuryForm(request.POST)
        if form.is_valid():
            transaction = form.save(commit=False)
            transaction.created_by = request.user.id
            transaction.save()
            messages.success(request, 'تم تسجيل الحركة بنجاح')
            return redirect('treasury:treasury_list')
    else:
        initial_type = request.GET.get('type', 'income')
        form = TreasuryForm(initial={'transaction_type': initial_type})
        
    return render(request, 'treasury/treasury_form.html', {
        'form': form,
        'title': 'تسجيل حركة خزينة'
    })
