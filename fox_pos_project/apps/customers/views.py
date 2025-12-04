from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import Customer
from .forms import CustomerForm
from django.core.paginator import Paginator

def customer_list(request):
    customers = Customer.objects.all().order_by('-created_at')
    paginator = Paginator(customers, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, 'customers/list.html', {'page_obj': page_obj})

def customer_create(request):
    if request.method == 'POST':
        form = CustomerForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم إضافة العميل بنجاح')
            return redirect('customers:list')
    else:
        # Generate a simple code suggestion
        last_customer = Customer.objects.order_by('customer_id').last()
        next_id = last_customer.customer_id + 1 if last_customer else 1
        initial_data = {'customer_code': f'CUST-{next_id:04d}'}
        form = CustomerForm(initial=initial_data)
        
    return render(request, 'customers/form.html', {'form': form, 'title': 'إضافة عميل جديد'})

def customer_update(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    if request.method == 'POST':
        form = CustomerForm(request.POST, instance=customer)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تحديث بيانات العميل بنجاح')
            return redirect('customers:list')
    else:
        form = CustomerForm(instance=customer)
    return render(request, 'customers/form.html', {'form': form, 'title': 'تعديل بيانات العميل'})

def customer_delete(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    if request.method == 'POST':
        customer.delete()
        messages.success(request, 'تم حذف العميل بنجاح')
        return redirect('customers:list')
    return render(request, 'customers/delete.html', {'customer': customer})
