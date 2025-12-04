from django import forms
from django.forms import inlineformset_factory
from .models import SalesReturn, SalesReturnItem, SalesInvoice
from apps.products.models import Product

class SalesReturnForm(forms.ModelForm):
    class Meta:
        model = SalesReturn
        fields = ['original_invoice', 'customer', 'refund_method', 'notes']
        widgets = {
            'original_invoice': forms.Select(attrs={'class': 'form-select select2'}),
            'customer': forms.Select(attrs={'class': 'form-select select2'}),
            'refund_method': forms.Select(choices=[
                ('cash', 'نقدي'),
                ('wallet', 'محفظة'),
                ('credit', 'آجل')
            ], attrs={'class': 'form-select'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
        }
        labels = {
            'original_invoice': 'فاتورة البيع الأصلية',
            'customer': 'العميل',
            'refund_method': 'طريقة الاسترجاع',
            'notes': 'ملاحظات',
        }

class SalesReturnItemForm(forms.ModelForm):
    class Meta:
        model = SalesReturnItem
        fields = ['product', 'quantity', 'unit_price']
        widgets = {
            'product': forms.Select(attrs={'class': 'form-select product-select'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control quantity-input', 'min': '1'}),
            'unit_price': forms.NumberInput(attrs={'class': 'form-control price-input', 'step': '0.01'}),
        }

SalesReturnItemFormSet = inlineformset_factory(
    SalesReturn, 
    SalesReturnItem, 
    form=SalesReturnItemForm,
    extra=1,
    can_delete=True,
    fields=['product', 'quantity', 'unit_price']
)
