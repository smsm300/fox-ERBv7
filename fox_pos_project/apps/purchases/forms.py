from django import forms
from django.forms import inlineformset_factory
from .models import PurchaseInvoice, PurchaseInvoiceItem, PurchaseReturn, PurchaseReturnItem
from apps.suppliers.models import Supplier
from apps.products.models import Product

class PurchaseInvoiceForm(forms.ModelForm):
    class Meta:
        model = PurchaseInvoice
        fields = ['invoice_number', 'supplier', 'payment_method', 'notes']
        widgets = {
            'invoice_number': forms.TextInput(attrs={'class': 'form-control'}),
            'supplier': forms.Select(attrs={'class': 'form-select select2'}),
            'payment_method': forms.Select(choices=[
                ('cash', 'نقدي'),
                ('credit', 'آجل'),
                ('bank_transfer', 'تحويل بنكي'),
                ('check', 'شيك')
            ], attrs={'class': 'form-select'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
        }
        labels = {
            'invoice_number': 'رقم الفاتورة',
            'supplier': 'المورد',
            'payment_method': 'طريقة الدفع',
            'notes': 'ملاحظات',
        }

class PurchaseInvoiceItemForm(forms.ModelForm):
    class Meta:
        model = PurchaseInvoiceItem
        fields = ['product', 'quantity', 'purchase_price', 'selling_price']
        widgets = {
            'product': forms.Select(attrs={'class': 'form-select product-select'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control quantity-input', 'min': '1'}),
            'purchase_price': forms.NumberInput(attrs={'class': 'form-control price-input', 'step': '0.01'}),
            'selling_price': forms.NumberInput(attrs={'class': 'form-control selling-price-input', 'step': '0.01'}),
        }

PurchaseItemFormSet = inlineformset_factory(
    PurchaseInvoice, 
    PurchaseInvoiceItem, 
    form=PurchaseInvoiceItemForm,
    extra=1,
    can_delete=True,
    fields=['product', 'quantity', 'purchase_price', 'selling_price']
)

class PurchaseReturnForm(forms.ModelForm):
    class Meta:
        model = PurchaseReturn
        fields = ['original_invoice', 'supplier', 'refund_method', 'notes']
        widgets = {
            'original_invoice': forms.Select(attrs={'class': 'form-select select2'}),
            'supplier': forms.Select(attrs={'class': 'form-select select2'}),
            'refund_method': forms.Select(choices=[
                ('cash', 'نقدي'),
                ('credit', 'آجل'),
                ('bank_transfer', 'تحويل بنكي')
            ], attrs={'class': 'form-select'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
        }
        labels = {
            'original_invoice': 'فاتورة الشراء الأصلية',
            'supplier': 'المورد',
            'refund_method': 'طريقة الاسترداد',
            'notes': 'ملاحظات',
        }

class PurchaseReturnItemForm(forms.ModelForm):
    class Meta:
        model = PurchaseReturnItem
        fields = ['product', 'quantity', 'unit_price']
        widgets = {
            'product': forms.Select(attrs={'class': 'form-select product-select'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control quantity-input', 'min': '1'}),
            'unit_price': forms.NumberInput(attrs={'class': 'form-control price-input', 'step': '0.01'}),
        }

PurchaseReturnItemFormSet = inlineformset_factory(
    PurchaseReturn, 
    PurchaseReturnItem, 
    form=PurchaseReturnItemForm,
    extra=1,
    can_delete=True,
    fields=['product', 'quantity', 'unit_price']
)
