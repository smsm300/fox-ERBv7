from django import forms
from .models import Product

class ProductForm(forms.ModelForm):
    image_file = forms.ImageField(
        required=False, 
        label='صورة المنتج',
        widget=forms.FileInput(attrs={'class': 'form-control'})
    )

    class Meta:
        model = Product
        fields = [
            'product_code', 'barcode', 'product_name', 'product_name_ar',
            'category', 'unit', 'purchase_price', 'selling_price',
            'min_stock_level', 'max_stock_level', 'current_stock',
            'is_active', 'allow_decimal', 'description'
        ]
        widgets = {
            'product_code': forms.TextInput(attrs={'class': 'form-control'}),
            'barcode': forms.TextInput(attrs={'class': 'form-control'}),
            'product_name': forms.TextInput(attrs={'class': 'form-control'}),
            'product_name_ar': forms.TextInput(attrs={'class': 'form-control'}),
            'category': forms.TextInput(attrs={'class': 'form-control'}),
            'unit': forms.TextInput(attrs={'class': 'form-control'}),
            'purchase_price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'selling_price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'min_stock_level': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'max_stock_level': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'current_stock': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'allow_decimal': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }
        labels = {
            'product_code': 'كود المنتج',
            'barcode': 'الباركود',
            'product_name': 'اسم المنتج (EN)',
            'product_name_ar': 'اسم المنتج (AR)',
            'category': 'القسم / التصنيف',
            'unit': 'الوحدة (قطعة/متر/كجم)',
            'purchase_price': 'سعر الشراء',
            'selling_price': 'سعر البيع',
            'min_stock_level': 'حد الطلب (الأدنى)',
            'max_stock_level': 'الحد الأقصى',
            'current_stock': 'الرصيد الحالي',
            'description': 'وصف المنتج',
            'is_active': 'نشط',
            'allow_decimal': 'يقبل الكسور',
        }
