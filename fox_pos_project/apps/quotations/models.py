from django.db import models
from apps.customers.models import Customer
from apps.products.models import Product

class Quotation(models.Model):
    quotation_id = models.AutoField(primary_key=True)
    quotation_number = models.CharField(max_length=50, unique=True)
    quotation_date = models.DateField(auto_now_add=True)
    customer = models.ForeignKey(Customer, on_delete=models.RESTRICT, db_column='customer_id')
    company_name = models.CharField(max_length=200, blank=True, null=True)
    contact_person = models.CharField(max_length=200, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    valid_until = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, default='draft')
    created_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'fox_system"."quotations'
        managed = False
        verbose_name = 'عرض سعر'
        verbose_name_plural = 'عروض الأسعار'

    def __str__(self):
        return self.quotation_number

class QuotationItem(models.Model):
    item_id = models.AutoField(primary_key=True)
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, db_column='quotation_id')
    product = models.ForeignKey(Product, on_delete=models.RESTRICT, db_column='product_id')
    product_description = models.TextField(blank=True, null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    product_image = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fox_system"."quotation_items'
        managed = False
        verbose_name = 'بند عرض سعر'
        verbose_name_plural = 'بنود عرض الأسعار'
