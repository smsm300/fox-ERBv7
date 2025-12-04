from django.db import models
from apps.suppliers.models import Supplier
from apps.products.models import Product

class PurchaseInvoice(models.Model):
    invoice_id = models.AutoField(primary_key=True)
    invoice_number = models.CharField(max_length=50, unique=True)
    invoice_date = models.DateField(auto_now_add=True)
    invoice_time = models.TimeField(auto_now_add=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.RESTRICT, db_column='supplier_id')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
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
        db_table = 'fox_system"."purchase_invoices'
        managed = False
        verbose_name = 'فاتورة مشتريات'
        verbose_name_plural = 'فواتير المشتريات'

    def __str__(self):
        return self.invoice_number

class PurchaseInvoiceItem(models.Model):
    item_id = models.AutoField(primary_key=True)
    invoice = models.ForeignKey(PurchaseInvoice, on_delete=models.CASCADE, db_column='invoice_id')
    product = models.ForeignKey(Product, on_delete=models.RESTRICT, db_column='product_id')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fox_system"."purchase_invoice_items'
        managed = False
        verbose_name = 'بند فاتورة مشتريات'
        verbose_name_plural = 'بنود فاتورة المشتريات'

class PurchaseReturn(models.Model):
    return_id = models.AutoField(primary_key=True)
    return_number = models.CharField(max_length=50, unique=True)
    return_date = models.DateField(auto_now_add=True)
    return_time = models.TimeField(auto_now_add=True)
    original_invoice = models.ForeignKey(PurchaseInvoice, on_delete=models.RESTRICT, db_column='original_invoice_id')
    supplier = models.ForeignKey(Supplier, on_delete=models.RESTRICT, db_column='supplier_id')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    refund_method = models.CharField(max_length=50, blank=True, null=True)
    is_processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(blank=True, null=True)
    created_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'fox_system"."purchase_returns'
        managed = False
        verbose_name = 'مرتجع مشتريات'
        verbose_name_plural = 'مرتجعات المشتريات'

    def __str__(self):
        return self.return_number

class PurchaseReturnItem(models.Model):
    item_id = models.AutoField(primary_key=True)
    return_obj = models.ForeignKey(PurchaseReturn, on_delete=models.CASCADE, db_column='return_id')
    product = models.ForeignKey(Product, on_delete=models.RESTRICT, db_column='product_id')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fox_system"."purchase_return_items'
        managed = False
        verbose_name = 'بند مرتجع مشتريات'
        verbose_name_plural = 'بنود مرتجع المشتريات'
