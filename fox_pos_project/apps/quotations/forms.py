from django import forms
from django.forms import inlineformset_factory
from .models import Quotation, QuotationItem

class QuotationForm(forms.ModelForm):
    class Meta:
        model = Quotation
        fields = ['quotation_number', 'customer', 'valid_until', 'notes']
        widgets = {
            'quotation_number': forms.TextInput(attrs={'class': 'form-control'}),
            'customer': forms.Select(attrs={'class': 'form-select select2'}),
            'valid_until': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
        }
        labels = {
            'quotation_number': 'رقم العرض',
            'customer': 'العميل',
            'valid_until': 'ساري حتى',
            'notes': 'ملاحظات',
        }

class QuotationItemForm(forms.ModelForm):
    class Meta:
        model = QuotationItem
        fields = ['product', 'quantity', 'unit_price']
        widgets = {
            'product': forms.Select(attrs={'class': 'form-select product-select'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control quantity-input', 'min': '1'}),
            'unit_price': forms.NumberInput(attrs={'class': 'form-control price-input', 'step': '0.01'}),
        }

QuotationItemFormSet = inlineformset_factory(
    Quotation, 
    QuotationItem, 
    form=QuotationItemForm,
    extra=1,
    can_delete=True,
    fields=['product', 'quantity', 'unit_price']
)
