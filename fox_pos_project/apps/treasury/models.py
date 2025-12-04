from django.db import models

class Treasury(models.Model):
    transaction_id = models.AutoField(primary_key=True)
    transaction_type = models.CharField(max_length=50)
    transaction_category = models.CharField(max_length=100, blank=True, null=True)
    reference_type = models.CharField(max_length=50, blank=True, null=True)
    reference_id = models.IntegerField(blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    transaction_date = models.DateField(auto_now_add=True)
    transaction_time = models.TimeField(auto_now_add=True)
    created_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'fox_system"."treasury'
        managed = False
        verbose_name = 'حركة خزينة'
        verbose_name_plural = 'حركات الخزينة'

    def __str__(self):
        return f"{self.transaction_type} - {self.amount}"

class MonthlyExpense(models.Model):
    expense_id = models.AutoField(primary_key=True)
    expense_name = models.CharField(max_length=200)
    expense_category = models.CharField(max_length=100, blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    expense_date = models.DateField(auto_now_add=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    is_recurring = models.BooleanField(default=False)
    created_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'fox_system"."monthly_expenses'
        managed = False
        verbose_name = 'مصروف شهري'
        verbose_name_plural = 'المصروفات الشهرية'

class OperatingCost(models.Model):
    cost_id = models.AutoField(primary_key=True)
    cost_name = models.CharField(max_length=200)
    cost_type = models.CharField(max_length=100, blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    cost_date = models.DateField(auto_now_add=True)
    reference_type = models.CharField(max_length=50, blank=True, null=True)
    reference_id = models.IntegerField(blank=True, null=True)
    created_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'fox_system"."operating_costs'
        managed = False
        verbose_name = 'تكلفة تشغيل'
        verbose_name_plural = 'تكاليف التشغيل'

class Debt(models.Model):
    debt_id = models.AutoField(primary_key=True)
    debt_type = models.CharField(max_length=20)
    entity_type = models.CharField(max_length=20)
    entity_id = models.IntegerField()
    reference_type = models.CharField(max_length=50, blank=True, null=True)
    reference_id = models.IntegerField(blank=True, null=True)
    original_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    remaining_amount = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'fox_system"."debts'
        managed = False
        verbose_name = 'دين'
        verbose_name_plural = 'الديون'

class DebtPayment(models.Model):
    payment_id = models.AutoField(primary_key=True)
    debt = models.ForeignKey(Debt, on_delete=models.CASCADE, db_column='debt_id')
    payment_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    created_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'fox_system"."debt_payments'
        managed = False
        verbose_name = 'سداد دين'
        verbose_name_plural = 'سدادات الديون'
