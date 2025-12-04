from django import forms
from .models import Supplier

class SupplierForm(forms.ModelForm):
    class Meta:
        model = Supplier
        fields = ['supplier_code', 'supplier_name', 'contact_person', 'phone', 'email', 
                 'address', 'credit_limit', 'is_active', 'notes']
        widgets = {
            'supplier_code': forms.TextInput(attrs={'class': 'form-control'}),
            'supplier_name': forms.TextInput(attrs={'class': 'form-control'}),
            'contact_person': forms.TextInput(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'credit_limit': forms.NumberInput(attrs={'class': 'form-control'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }
        labels = {
            'supplier_code': 'كود المورد',
            'supplier_name': 'اسم المورد',
            'contact_person': 'الشخص المسؤول',
            'phone': 'رقم الهاتف',
            'email': 'البريد الإلكتروني',
            'address': 'العنوان',
            'credit_limit': 'الحد الائتماني',
            'is_active': 'نشط',
            'notes': 'ملاحظات',
        }
