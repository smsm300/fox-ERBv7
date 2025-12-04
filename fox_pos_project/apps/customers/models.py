from django.db import models

class Customer(models.Model):
    CUSTOMER_TYPES = [
        ('regular', 'عميل عادي'),
        ('consumer', 'مستهلك'),
    ]

    customer_id = models.AutoField(primary_key=True)
    customer_code = models.CharField(max_length=50, unique=True)
    customer_name = models.CharField(max_length=200)
    customer_type = models.CharField(max_length=20, choices=CUSTOMER_TYPES, default='regular')
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
        db_table = 'fox_system"."customers'
        managed = False
        verbose_name = 'عميل'
        verbose_name_plural = 'العملاء'

    def __str__(self):
        return f"{self.customer_code} - {self.customer_name}"
