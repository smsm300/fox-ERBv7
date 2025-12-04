from django import forms
from .models import Customer

class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['customer_code', 'customer_name', 'customer_type', 'phone', 'phone2', 'email', 
                  'address', 'city', 'credit_limit', 'is_active', 'notes']
        widgets = {
            'customer_code': forms.TextInput(attrs={'class': 'form-control'}),
            'customer_name': forms.TextInput(attrs={'class': 'form-control'}),
            'customer_type': forms.Select(attrs={'class': 'form-select'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'phone2': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'city': forms.TextInput(attrs={'class': 'form-control'}),
            'credit_limit': forms.NumberInput(attrs={'class': 'form-control'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }
        labels = {
            'customer_code': 'كود العميل',
            'customer_name': 'اسم العميل',
            'customer_type': 'نوع العميل',
            'phone': 'رقم الهاتف',
            'phone2': 'رقم هاتف بديل',
            'email': 'البريد الإلكتروني',
            'address': 'العنوان',
            'city': 'المدينة',
            'credit_limit': 'الحد الائتماني',
            'is_active': 'نشط',
            'notes': 'ملاحظات',
        }
