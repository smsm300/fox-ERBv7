from rest_framework import serializers
from .models import Quotation, QuotationItem

class QuotationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationItem
        fields = '__all__'

class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, read_only=True, source='quotationitem_set')
    
    class Meta:
        model = Quotation
        fields = '__all__'
