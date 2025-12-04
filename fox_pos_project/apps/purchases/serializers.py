from rest_framework import serializers
from .models import PurchaseInvoice, PurchaseInvoiceItem, PurchaseReturn, PurchaseReturnItem

class PurchaseInvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseInvoiceItem
        fields = '__all__'

class PurchaseInvoiceSerializer(serializers.ModelSerializer):
    items = PurchaseInvoiceItemSerializer(many=True, read_only=True, source='purchaseinvoiceitem_set')
    
    class Meta:
        model = PurchaseInvoice
        fields = '__all__'

class PurchaseReturnItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseReturnItem
        fields = '__all__'

class PurchaseReturnSerializer(serializers.ModelSerializer):
    items = PurchaseReturnItemSerializer(many=True, read_only=True, source='purchasereturnitem_set')

    class Meta:
        model = PurchaseReturn
        fields = '__all__'
