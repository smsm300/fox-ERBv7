from django.db import models

class DailySalesSummary(models.Model):
    invoice_date = models.DateField(primary_key=True)
    total_invoices = models.IntegerField()
    unique_customers = models.IntegerField()
    total_sales = models.DecimalField(max_digits=12, decimal_places=2)
    total_discounts = models.DecimalField(max_digits=12, decimal_places=2)
    net_sales = models.DecimalField(max_digits=12, decimal_places=2)
    collected_amount = models.DecimalField(max_digits=12, decimal_places=2)
    outstanding_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_invoices = models.IntegerField()
    partial_invoices = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'fox_system"."v_daily_sales_summary'
        verbose_name = 'ملخص المبيعات اليومي'
        verbose_name_plural = 'ملخص المبيعات اليومي'

class InventorySummary(models.Model):
    product_id = models.IntegerField(primary_key=True)
    product_code = models.CharField(max_length=50)
    barcode = models.CharField(max_length=50)
    product_name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    unit = models.CharField(max_length=50)
    current_stock = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_value_cost = models.DecimalField(max_digits=12, decimal_places=2)
    stock_value_selling = models.DecimalField(max_digits=12, decimal_places=2)
    min_stock_level = models.DecimalField(max_digits=10, decimal_places=2)
    max_stock_level = models.DecimalField(max_digits=10, decimal_places=2)
    stock_status = models.CharField(max_length=50)
    is_active = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'fox_system"."v_inventory_summary'
        verbose_name = 'تقرير المخزون'
        verbose_name_plural = 'تقارير المخزون'

class OutstandingDebt(models.Model):
    debt_id = models.IntegerField(primary_key=True)
    debt_type = models.CharField(max_length=50)
    entity_type = models.CharField(max_length=50)
    entity_name = models.CharField(max_length=200)
    entity_phone = models.CharField(max_length=50)
    original_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2)
    remaining_amount = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=50)
    aging_status = models.CharField(max_length=50)
    days_overdue = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'fox_system"."v_outstanding_debts'
        verbose_name = 'تقرير الديون'
        verbose_name_plural = 'تقارير الديون'

class TreasuryBalanceReport(models.Model):
    payment_method = models.CharField(max_length=50, primary_key=True)
    total_income = models.DecimalField(max_digits=12, decimal_places=2)
    total_expense = models.DecimalField(max_digits=12, decimal_places=2)
    opening_balance = models.DecimalField(max_digits=12, decimal_places=2)
    net_balance = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'fox_system"."v_treasury_balance'
        verbose_name = 'تقرير الخزينة'
        verbose_name_plural = 'تقارير الخزينة'

class ProfitabilityReport(models.Model):
    # Using invoice_number + product_name as a composite key workaround for Django admin if needed, 
    # but for read-only views we can just use a dummy primary key or one of the fields if unique enough.
    # However, views don't strictly need a PK if we don't use the admin or certain lookups.
    # We'll use invoice_number as PK for now, though it might not be unique per row (since it's per item).
    # Better to treat it as a read-only list.
    invoice_date = models.DateField()
    invoice_number = models.CharField(max_length=50, primary_key=True) 
    customer_name = models.CharField(max_length=200)
    product_name = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    cost = models.DecimalField(max_digits=12, decimal_places=2)
    revenue = models.DecimalField(max_digits=12, decimal_places=2)
    profit = models.DecimalField(max_digits=12, decimal_places=2)
    profit_margin_percentage = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'fox_system"."v_profitability_report'
        verbose_name = 'تقرير الربحية'
        verbose_name_plural = 'تقارير الربحية'
