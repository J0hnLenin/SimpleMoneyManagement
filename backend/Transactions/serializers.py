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
    parent_name = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'
    
    def get_subcategories(self, obj):
        return list(
            obj.subcategories.values_list('name', flat=True)
        )
    def get_parent_name(self, obj):
        if obj.parent is None:
            return None
        else:
            return obj.parent.name
        
    
    def validate(self, attrs):
        # Валидация родителя
        if self.instance is not None and attrs["parent"] == self.instance:
            raise serializers.ValidationError("Категория не может быть подкатегорией самой себя")

        # Проверка уровня вложенности
        if attrs["parent"] is not None and attrs["parent"].parent is not None:
            raise serializers.ValidationError("Вложенность больше двух уровней не поддерживается")
        
        # Валидация типа транзакции
        if (attrs["parent"] is not None) and (attrs["parent"].transaction_type is not None) \
            and (attrs["transaction_type"] != attrs["parent"].transaction_type):
            raise serializers.ValidationError("Тип транзакции подкатегории должен совпадать с типом транзакции категории")

        return attrs
    
    def update(self, instance, validated_data):
        # Сохраняем старый тип транзакции для сравнения
        old_transaction_type = instance.transaction_type
        new_transaction_type = validated_data.get('transaction_type', old_transaction_type)
        
        # Если тип транзакции изменился, обновляем все подкатегории
        if old_transaction_type != new_transaction_type and new_transaction_type is not None:
            instance.subcategories.all().update(transaction_type=new_transaction_type)
        
        return super().update(instance, validated_data)
    
class TransactionSerializer(serializers.HyperlinkedModelSerializer):

    creation_date = serializers.DateField(
        default=timezone.now().date()
    )
    amount = serializers.SerializerMethodField()
    class Meta:
        model = Transaction
        fields = '__all__'
    
    def get_amount(self, obj):
        """Метод для получения значения вычисляемого поля amount"""
        return obj.amount
    
    def validate(self, attrs):
        """Метод для валидации транзакции"""

        # Валидация типа транзакции
        if attrs["transaction_type"] != attrs["category"].transaction_type:
            raise serializers.ValidationError("Тип транзакции подкатегории должен совпадать с типом транзакции категории")

        return attrs