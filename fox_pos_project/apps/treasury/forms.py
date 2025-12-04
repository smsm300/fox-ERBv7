from django import forms
from .models import Treasury

class TreasuryForm(forms.ModelForm):
    class Meta:
        model = Treasury
        fields = ['transaction_type', 'transaction_category', 'amount', 'payment_method', 'description']
        widgets = {
            'transaction_type': forms.Select(choices=[
                ('income', 'إيراد'),
                ('expense', 'مصروف'),
                ('opening_balance', 'رصيد افتتاحي')
            ], attrs={'class': 'form-select'}),
            'transaction_category': forms.TextInput(attrs={'class': 'form-control'}),
            'amount': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'payment_method': forms.Select(choices=[
                ('cash', 'نقدي'),
                ('credit', 'آجل'),
                ('bank_transfer', 'تحويل بنكي'),
                ('check', 'شيك')
            ], attrs={'class': 'form-select'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }
        labels = {
            'transaction_type': 'نوع الحركة',
            'transaction_category': 'التصنيف',
            'amount': 'المبلغ',
            'payment_method': 'طريقة الدفع',
            'description': 'الوصف',
        }
