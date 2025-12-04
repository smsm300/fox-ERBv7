from django.db import models

class Supplier(models.Model):
    supplier_id = models.AutoField(primary_key=True)
    supplier_code = models.CharField(max_length=50, unique=True)
    supplier_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=200, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    phone2 = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'fox_system"."suppliers'
        managed = False
        verbose_name = 'مورد'
        verbose_name_plural = 'الموردين'

    def __str__(self):
        return f"{self.supplier_code} - {self.supplier_name}"
