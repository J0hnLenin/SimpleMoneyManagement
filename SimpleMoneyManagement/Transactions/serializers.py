from rest_framework import serializers
from Transactions.models import Status, TransactionType, Category, Transaction
from django.utils import timezone

class StatusSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'

class TransactionTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = TransactionType
        fields = '__all__'

class CategorySerializer(serializers.HyperlinkedModelSerializer):
    subcategories = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = '__all__'
    
    def get_subcategories(self, obj):
        return list(
            obj.subcategories.values_list('id', flat=True)
        )
    
class TransactionSerializer(serializers.HyperlinkedModelSerializer):
    amount = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        read_only=True
    )
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'creation_date', 'status', 'transaction_type',
            'category', 'absolute_amount', 'amount', 'comment'
        ]
        extra_kwargs = {
            'absolute_amount': {'required': True},
            'transaction_type': {'required': True},
            'category': {'required': True},
            'status': {'required': True},
        }