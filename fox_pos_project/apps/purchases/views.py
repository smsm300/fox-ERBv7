from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import transaction
from django.utils import timezone
from .models import PurchaseInvoice, PurchaseInvoiceItem, PurchaseReturn, PurchaseReturnItem
from .forms import PurchaseInvoiceForm, PurchaseItemFormSet, PurchaseReturnForm, PurchaseReturnItemFormSet
from apps.suppliers.models import Supplier
from apps.products.models import Product

@login_required
def purchase_list(request):
    invoices = PurchaseInvoice.objects.all().order_by('-created_at')
    return render(request, 'purchases/purchase_list.html', {'invoices': invoices})

@login_required
def purchase_create(request):
    if request.method == 'POST':
        form = PurchaseInvoiceForm(request.POST)
        formset = PurchaseItemFormSet(request.POST)
        
        if form.is_valid() and formset.is_valid():
            try:
                with transaction.atomic():
                    invoice = form.save(commit=False)
                    invoice.created_by = request.user
                    
                    # Calculate total amount from items
                    total_amount = 0
                    items = formset.save(commit=False)
                    
                    # First save invoice to get ID
                    invoice.total_amount = 0 # Temporary
                    invoice.paid_amount = 0 # Default
                    invoice.remaining_amount = 0 # Default
                    invoice.save()
                    
                    for item in items:
                        item.invoice = invoice
                        item.total = item.quantity * item.purchase_price
                        total_amount += item.total
                        item.save()
                    
                    # Update invoice totals
                    invoice.total_amount = total_amount
                    # For simplicity in this MVP, assuming full payment if cash, else logic can be added
                    if invoice.payment_method == 'cash':
                        invoice.paid_amount = total_amount
                        invoice.remaining_amount = 0
                        invoice.payment_status = 'paid'
                    else:
                        invoice.paid_amount = 0
                        invoice.remaining_amount = total_amount
                        invoice.payment_status = 'unpaid'
                        
                    invoice.save()
                    
                    messages.success(request, 'تم حفظ فاتورة الشراء بنجاح')
                    return redirect('purchases:purchase_list')
            except Exception as e:
                messages.error(request, f'حدث خطأ أثناء الحفظ: {str(e)}')
        else:
            messages.error(request, 'الرجاء التأكد من صحة البيانات المدخلة')
    else:
        form = PurchaseInvoiceForm()
        formset = PurchaseItemFormSet()
        
    return render(request, 'purchases/purchase_form.html', {
        'form': form,
        'formset': formset,
        'title': 'إضافة فاتورة شراء'
    })

@login_required
def purchase_detail(request, pk):
    invoice = get_object_or_404(PurchaseInvoice, pk=pk)
    items = invoice.purchaseinvoiceitem_set.all()
    return render(request, 'purchases/purchase_detail.html', {'invoice': invoice, 'items': items})

@login_required
def purchase_return_list(request):
    returns = PurchaseReturn.objects.all().order_by('-created_at')
    return render(request, 'purchases/return_list.html', {'returns': returns})

@login_required
def purchase_return_create(request):
    if request.method == 'POST':
        form = PurchaseReturnForm(request.POST)
        formset = PurchaseReturnItemFormSet(request.POST)
        
        if form.is_valid() and formset.is_valid():
            try:
                with transaction.atomic():
                    return_obj = form.save(commit=False)
                    return_obj.created_by = request.user.id
                    
                    # Generate Return Number
                    today = timezone.now().strftime('%Y%m%d')
                    last_return = PurchaseReturn.objects.filter(return_number__startswith=f'RET-{today}').order_by('-return_number').first()
                    if last_return:
                        try:
                            seq = int(last_return.return_number.split('-')[-1]) + 1
                        except ValueError:
                            seq = 1
                    else:
                        seq = 1
                    return_obj.return_number = f'RET-{today}-{seq:04d}'
                    
                    total_amount = 0
                    items = formset.save(commit=False)
                    
                    # First save return to get ID
                    return_obj.total_amount = 0
                    return_obj.save()
                    
                    for item in items:
                        item.return_obj = return_obj
                        item.total = item.quantity * item.unit_price
                        total_amount += item.total
                        item.save()
                    
                    return_obj.total_amount = total_amount
                    return_obj.is_processed = True
                    return_obj.processed_at = timezone.now()
                    return_obj.save()
                    
                    messages.success(request, 'تم حفظ مرتجع المشتريات بنجاح')
                    return redirect('purchases:return_list')
            except Exception as e:
                messages.error(request, f'حدث خطأ أثناء الحفظ: {str(e)}')
        else:
            messages.error(request, 'الرجاء التأكد من صحة البيانات المدخلة')
    else:
        form = PurchaseReturnForm()
        formset = PurchaseReturnItemFormSet()
        
    return render(request, 'purchases/return_form.html', {
        'form': form,
        'formset': formset,
        'title': 'إضافة مرتجع مشتريات'
    })
