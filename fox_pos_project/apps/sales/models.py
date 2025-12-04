from django.db import models
from apps.customers.models import Customer
from apps.products.models import Product

class SalesInvoice(models.Model):
    invoice_id = models.AutoField(primary_key=True)
    invoice_number = models.CharField(max_length=50, unique=True)
    invoice_type = models.CharField(max_length=20, default='regular')
    invoice_date = models.DateField(auto_now_add=True)
    invoice_time = models.TimeField(auto_now_add=True)
    customer = models.ForeignKey(Customer, on_delete=models.RESTRICT, db_column='customer_id')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    remaining_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    payment_status = models.CharField(max_length=20, default='pending')
    created_by = models.IntegerField(blank=True, null=True)
    is_cancelled = models.BooleanField(default=False)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'fox_system"."sales_invoices'
        managed = False
        verbose_name = 'فاتورة مبيعات'
        verbose_name_plural = 'فواتير المبيعات'

    def __str__(self):
        return self.invoice_number

class SalesInvoiceItem(models.Model):
    item_id = models.AutoField(primary_key=True)
    invoice = models.ForeignKey(SalesInvoice, on_delete=models.CASCADE, db_column='invoice_id')
    product = models.ForeignKey(Product, on_delete=models.RESTRICT, db_column='product_id')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fox_system"."sales_invoice_items'
        managed = False
        verbose_name = 'بند فاتورة مبيعات'
        verbose_name_plural = 'بنود فاتورة المبيعات'

class SalesReturn(models.Model):
    return_id = models.AutoField(primary_key=True)
    return_number = models.CharField(max_length=50, unique=True)
    return_date = models.DateField(auto_now_add=True)
    return_time = models.TimeField(auto_now_add=True)
    original_invoice = models.ForeignKey(SalesInvoice, on_delete=models.RESTRICT, db_column='original_invoice_id')
    customer = models.ForeignKey(Customer, on_delete=models.RESTRICT, db_column='customer_id')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    refund_method = models.CharField(max_length=50, blank=True, null=True)
    is_processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(blank=True, null=True)
    created_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'fox_system"."sales_returns'
        managed = False
        verbose_name = 'مرتجع مبيعات'
        verbose_name_plural = 'مرتجعات المبيعات'

    def __str__(self):
        return self.return_number

class SalesReturnItem(models.Model):
    item_id = models.AutoField(primary_key=True)
    return_obj = models.ForeignKey(SalesReturn, on_delete=models.CASCADE, db_column='return_id')
    product = models.ForeignKey(Product, on_delete=models.RESTRICT, db_column='product_id')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fox_system"."sales_return_items'
        managed = False
        verbose_name = 'بند مرتجع مبيعات'
        verbose_name_plural = 'بنود مرتجع المبيعات'
