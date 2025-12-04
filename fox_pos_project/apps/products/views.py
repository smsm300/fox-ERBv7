from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator
from django.contrib import messages
from django.core.files.storage import FileSystemStorage
from .models import Product
from .forms import ProductForm
import os

def product_list(request):
    products = Product.objects.all().order_by('-created_at')
    paginator = Paginator(products, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, 'products/list.html', {'page_obj': page_obj})

def product_create(request):
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            product = form.save(commit=False)
            
            # Handle Image Upload
            if 'image_file' in request.FILES:
                image = request.FILES['image_file']
                fs = FileSystemStorage()
                filename = fs.save(f'products/{image.name}', image)
                product.product_image = fs.url(filename)
            
            product.save()
            messages.success(request, 'تم إضافة المنتج بنجاح')
            return redirect('products:list')
    else:
        form = ProductForm()
    return render(request, 'products/form.html', {'form': form, 'title': 'إضافة منتج جديد'})

def product_update(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            product = form.save(commit=False)
            
            # Handle Image Upload
            if 'image_file' in request.FILES:
                image = request.FILES['image_file']
                fs = FileSystemStorage()
                # Delete old image if exists? Maybe later.
                filename = fs.save(f'products/{image.name}', image)
                product.product_image = fs.url(filename)
            
            product.save()
            messages.success(request, 'تم تعديل المنتج بنجاح')
            return redirect('products:list')
    else:
        form = ProductForm(instance=product)
    return render(request, 'products/form.html', {'form': form, 'title': 'تعديل بيانات المنتج'})

def product_delete(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == 'POST':
        product.delete()
        messages.success(request, 'تم حذف المنتج بنجاح')
        return redirect('products:list')
    return render(request, 'products/delete.html', {'product': product})
