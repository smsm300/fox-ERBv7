from rest_framework import serializers
from .models import Treasury, MonthlyExpense, OperatingCost, Debt, DebtPayment

class TreasurySerializer(serializers.ModelSerializer):
    class Meta:
        model = Treasury
        fields = '__all__'

class MonthlyExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyExpense
        fields = '__all__'

class OperatingCostSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatingCost
        fields = '__all__'

class DebtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Debt
        fields = '__all__'

class DebtPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DebtPayment
        fields = '__all__'
