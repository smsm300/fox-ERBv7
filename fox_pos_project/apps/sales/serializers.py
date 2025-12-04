from rest_framework import serializers
from .models import SalesInvoice, SalesInvoiceItem, SalesReturn, SalesReturnItem

class SalesInvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesInvoiceItem
        fields = '__all__'

class SalesInvoiceSerializer(serializers.ModelSerializer):
    items = SalesInvoiceItemSerializer(many=True, read_only=True, source='salesinvoiceitem_set')
    
    class Meta:
        model = SalesInvoice
        fields = '__all__'

class SalesReturnItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesReturnItem
        fields = '__all__'

class SalesReturnSerializer(serializers.ModelSerializer):
    items = SalesReturnItemSerializer(many=True, read_only=True, source='salesreturnitem_set')

    class Meta:
        model = SalesReturn
        fields = '__all__'
