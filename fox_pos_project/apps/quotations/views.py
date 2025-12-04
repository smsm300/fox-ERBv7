from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import transaction
from .models import Quotation, QuotationItem
from .forms import QuotationForm, QuotationItemFormSet

@login_required
def quotation_list(request):
    quotations = Quotation.objects.all().order_by('-created_at')
    return render(request, 'quotations/quotation_list.html', {'quotations': quotations})

@login_required
def quotation_create(request):
    if request.method == 'POST':
        form = QuotationForm(request.POST)
        formset = QuotationItemFormSet(request.POST)
        
        if form.is_valid() and formset.is_valid():
            try:
                with transaction.atomic():
                    quotation = form.save(commit=False)
                    quotation.created_by = request.user.id
                    
                    # Calculate total amount from items
                    total_amount = 0
                    items = formset.save(commit=False)
                    
                    # First save quotation to get ID
                    quotation.total_amount = 0
                    quotation.save()
                    
                    for item in items:
                        item.quotation = quotation
                        item.total = item.quantity * item.unit_price
                        total_amount += item.total
                        item.save()
                    
                    # Update quotation totals
                    quotation.total_amount = total_amount
                    quotation.subtotal = total_amount # Simplified for now (no tax/discount logic yet)
                    quotation.save()
                    
                    messages.success(request, 'تم حفظ عرض السعر بنجاح')
                    return redirect('quotations:quotation_list')
            except Exception as e:
                messages.error(request, f'حدث خطأ أثناء الحفظ: {str(e)}')
        else:
            messages.error(request, 'الرجاء التأكد من صحة البيانات المدخلة')
    else:
        form = QuotationForm()
        formset = QuotationItemFormSet()
        
    return render(request, 'quotations/quotation_form.html', {
        'form': form,
        'formset': formset,
        'title': 'إضافة عرض سعر جديد'
    })

@login_required
def quotation_detail(request, pk):
    quotation = get_object_or_404(Quotation, pk=pk)
    items = quotation.quotationitem_set.all()
    return render(request, 'quotations/quotation_detail.html', {'quotation': quotation, 'items': items})

@login_required
def quotation_print(request, pk):
    quotation = get_object_or_404(Quotation, pk=pk)
    items = quotation.quotationitem_set.all()
    return render(request, 'quotations/quotation_print.html', {'quotation': quotation, 'items': items})
