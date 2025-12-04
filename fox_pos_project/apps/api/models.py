from django.db import models
from django.contrib.auth.models import User
from apps.customers.models import Customer
from apps.suppliers.models import Supplier


class Transaction(models.Model):
    """Model for all financial transactions"""
    TYPE_CHOICES = [
        ('بيع', 'بيع'),
        ('شراء', 'شراء'),
        ('مصروف', 'مصروف'),
        ('مرتجع', 'مرتجع'),
        ('تسوية مخزون', 'تسوية مخزون'),
        ('إيداع رأس مال', 'إيداع رأس مال'),
        ('مسحوبات شخصية', 'مسحوبات شخصية'),
        ('تسوية دين', 'تسوية دين'),
    ]
    PAYMENT_CHOICES = [
        ('كاش', 'كاش'),
        ('محفظة', 'محفظة'),
        ('Instapay', 'Instapay'),
        ('آجل', 'آجل'),
    ]
    STATUS_CHOICES = [
        ('pending', 'معلق'),
        ('completed', 'مكتمل'),
        ('rejected', 'مرفوض'),
    ]
    
    transaction_id = models.CharField(max_length=50, primary_key=True)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    date = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_CHOICES)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    related_customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, db_column='related_customer_id')
    related_supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, db_column='related_supplier_id')
    items = models.JSONField(default=list, blank=True)  # CartItem[]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    due_date = models.DateField(null=True, blank=True)
    is_direct_sale = models.BooleanField(default=False)
    shift = models.ForeignKey('Shift', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions', db_column='shift_id')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, db_column='created_by_id')
    
    class Meta:
        db_table = 'fox_system"."transactions'
        verbose_name = 'معاملة'
        verbose_name_plural = 'المعاملات'
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.transaction_id} - {self.type} - {self.amount}"


class Shift(models.Model):
    """Model for shift management"""
    STATUS_CHOICES = [
        ('open', 'مفتوحة'),
        ('closed', 'مغلقة'),
    ]
    
    shift_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shifts')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    start_cash = models.DecimalField(max_digits=12, decimal_places=2)
    end_cash = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    expected_cash = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_sales = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    sales_by_method = models.JSONField(default=dict, blank=True)  # {PaymentMethod: amount}
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    class Meta:
        db_table = 'fox_system"."shifts'
        verbose_name = 'وردية'
        verbose_name_plural = 'الورديات'
        ordering = ['-start_time']
    
    def __str__(self):
        return f"Shift {self.shift_id} - {self.user.username} - {self.status}"



class AppSettings(models.Model):
    """Singleton model for application settings"""
    settings_id = models.IntegerField(primary_key=True, default=1)
    company_name = models.CharField(max_length=200, default='FOX GROUP')
    company_phone = models.CharField(max_length=20, default='')
    company_address = models.TextField(default='')
    logo_url = models.URLField(blank=True, null=True)
    auto_print = models.BooleanField(default=False)
    next_invoice_number = models.IntegerField(default=1001)
    opening_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=14)
    current_shift = models.ForeignKey(Shift, on_delete=models.SET_NULL, null=True, blank=True, related_name='current_settings', db_column='current_shift_id')
    prevent_negative_stock = models.BooleanField(default=False)
    invoice_terms = models.TextField(default='')
    
    class Meta:
        db_table = 'fox_system"."app_settings'
        verbose_name = 'إعدادات التطبيق'
        verbose_name_plural = 'إعدادات التطبيق'
    
    def save(self, *args, **kwargs):
        """Ensure singleton - only one settings record exists"""
        self.settings_id = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Get or create the singleton settings instance"""
        settings, created = cls.objects.get_or_create(settings_id=1)
        return settings
    
    def __str__(self):
        return f"Settings - {self.company_name}"



class ActivityLog(models.Model):
    """Model for activity logging"""
    log_id = models.AutoField(primary_key=True)
    date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='activity_logs', db_column='user_id')
    user_name = models.CharField(max_length=200)
    action = models.CharField(max_length=100)
    details = models.TextField()
    
    class Meta:
        db_table = 'fox_system"."activity_logs'
        verbose_name = 'سجل نشاط'
        verbose_name_plural = 'سجلات النشاط'
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user_name} - {self.action} - {self.date}"
