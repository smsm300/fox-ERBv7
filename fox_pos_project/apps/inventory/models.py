from django.db import models
from apps.products.models import Product

class InventoryMovement(models.Model):
    movement_id = models.AutoField(primary_key=True)
    movement_type = models.CharField(max_length=50)
    reference_type = models.CharField(max_length=50, blank=True, null=True)
    reference_id = models.IntegerField(blank=True, null=True)
    product = models.ForeignKey(Product, on_delete=models.RESTRICT, db_column='product_id')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_before = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    quantity_after = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    movement_date = models.DateTimeField(auto_now_add=True)
    created_by = models.IntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'fox_system"."inventory_movements'
        managed = False
        verbose_name = 'حركة مخزون'
        verbose_name_plural = 'حركات المخزون'

    def __str__(self):
        return f"{self.movement_type} - {self.product.product_name}"
