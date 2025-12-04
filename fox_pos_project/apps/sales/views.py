from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.db import transaction
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from apps.products.models import Product
from apps.customers.models import Customer
from .models import SalesInvoice, SalesInvoiceItem, SalesReturn, SalesReturnItem
from .forms import SalesReturnForm, SalesReturnItemFormSet
import json
import decimal

@login_required
def pos_view(request):
    customers = Customer.objects.filter(is_active=True)
    return render(request, 'sales/pos.html', {'customers': customers})

def api_products(request):
    products = Product.objects.filter(is_active=True).values(
        'product_id', 'product_name', 'product_code', 'barcode', 
        'selling_price', 'product_image', 'current_stock'
    )
    return JsonResponse(list(products), safe=False)

@csrf_exempt
@transaction.atomic
def api_create_invoice(request):
    if request.method == 'POST':
        try:
            # Try to parse JSON body
            if request.body:
                try:
                    data = json.loads(request.body)
                except json.JSONDecodeError:
                    data = request.POST
            else:
                data = request.POST
            
            customer_id = data.get('customer_id')
            items = data.get('items', [])
            payment_method = data.get('payment_method')
            paid_amount = float(data.get('paid_amount', 0))
            
            if not customer_id or not items:
                return JsonResponse({'success': False, 'error': 'بيانات غير مكتملة'})
            
            customer = Customer.objects.get(pk=customer_id)
            
            # Generate Invoice Number
            today = timezone.now().strftime('%Y%m%d')
            last_invoice = SalesInvoice.objects.filter(invoice_number__startswith=f'INV-{today}').order_by('-invoice_number').first()
            if last_invoice:
                try:
                    seq = int(last_invoice.invoice_number.split('-')[-1]) + 1
                except ValueError:
                    seq = 1
            else:
                seq = 1
            invoice_number = f'INV-{today}-{seq:04d}'
            
            # Calculate totals
            subtotal = 0
            invoice_items_to_create = []
            
            for item in items:
                product = Product.objects.get(pk=item['product_id'])
                qty = decimal.Decimal(str(item['quantity']))
                price = decimal.Decimal(str(item['price']))
                
                # Check Stock
                if product.current_stock < qty:
                    raise Exception(f'الكمية غير متوفرة للمنتج: {product.product_name}')
                
                item_subtotal = qty * price
                subtotal += float(item_subtotal)
                
                # Update Stock
                product.current_stock -= qty
                product.save()
                
                invoice_items_to_create.append({
                    'product': product,
                    'quantity': qty,
                    'unit_price': price,
                    'subtotal': item_subtotal,
                    'total': item_subtotal # assuming no discount per item for now
                })
            
            tax_amount = 0 
            total_amount = subtotal + tax_amount
            remaining = total_amount - paid_amount
            
            # Create Invoice
            invoice = SalesInvoice.objects.create(
                invoice_number=invoice_number,
                customer=customer,
                subtotal=subtotal,
                tax_amount=tax_amount,
                total_amount=total_amount,
                paid_amount=paid_amount,
                remaining_amount=remaining,
                payment_method=payment_method,
                payment_status='paid' if remaining <= 0 else 'partial'
            )
            
            # Create Items
            for item_data in invoice_items_to_create:
                SalesInvoiceItem.objects.create(
                    invoice=invoice,
                    product=item_data['product'],
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price'],
                    subtotal=item_data['subtotal'],
                    total=item_data['total']
                )
            
            # Update Customer Balance if debt
            if remaining > 0:
                customer.current_balance += remaining
                customer.save()
                
            return JsonResponse({'success': True, 'invoice_number': invoice_number})
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': False, 'error': 'Invalid method'})

@login_required
def sales_return_list(request):
    returns = SalesReturn.objects.all().order_by('-created_at')
    return render(request, 'sales/return_list.html', {'returns': returns})

@login_required
def sales_return_create(request):
    if request.method == 'POST':
        form = SalesReturnForm(request.POST)
        formset = SalesReturnItemFormSet(request.POST)
        
        if form.is_valid() and formset.is_valid():
            try:
                with transaction.atomic():
                    return_obj = form.save(commit=False)
                    return_obj.created_by = request.user.id
                    
                    # Generate Return Number
                    today = timezone.now().strftime('%Y%m%d')
                    last_return = SalesReturn.objects.filter(return_number__startswith=f'RET-{today}').order_by('-return_number').first()
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
                        
                        # Update Stock (Return to stock)
                        # Note: The DB trigger 'trg_update_stock_after_sales_return' handles this automatically!
                        # But we need to make sure the trigger is enabled and working.
                        # If trigger is relied upon, we don't need to update stock here manually.
                    
                    return_obj.total_amount = total_amount
                    return_obj.is_processed = True
                    return_obj.processed_at = timezone.now()
                    return_obj.save()
                    
                    messages.success(request, 'تم حفظ مرتجع المبيعات بنجاح')
                    return redirect('sales:return_list')
            except Exception as e:
                messages.error(request, f'حدث خطأ أثناء الحفظ: {str(e)}')
        else:
            messages.error(request, 'الرجاء التأكد من صحة البيانات المدخلة')
    else:
        form = SalesReturnForm()
        formset = SalesReturnItemFormSet()
        
    return render(request, 'sales/return_form.html', {
        'form': form,
        'formset': formset,
        'title': 'إضافة مرتجع مبيعات'
    })
