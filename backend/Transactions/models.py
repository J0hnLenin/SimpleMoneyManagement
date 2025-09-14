from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from decimal import Decimal
from django.utils import timezone

class Status(models.Model):
    """Справочник статусов"""
    name = models.CharField(max_length=255, unique=True, verbose_name="Название статуса")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    
    class Meta:
        verbose_name = "Статус"
        verbose_name_plural = "Статусы"
        ordering = ['is_active', 'name']
    
    def __str__(self):
        return self.name
    
class TransactionType(models.Model):
    """Справочник типов операций"""
    name = models.CharField(max_length=255, unique=True, verbose_name="Тип операции")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    is_positive = models.BooleanField(
        default=True,
        verbose_name="Положительная операция",
        help_text="Определяет знак операции (+)/(-)"
    )

    class Meta:
        verbose_name = "Тип операции"
        verbose_name_plural = "Типы операций"
        ordering = ['is_active', 'name']
    
    def __str__(self):
        return self.name
    
class Category(models.Model):
    """Иерархический справочник категорий"""
    name = models.CharField(max_length=255, unique=True, verbose_name="Название категории")
    parent = models.ForeignKey(
        'self', 
        on_delete=models.PROTECT, 
        null=True,
        blank=True, 
        related_name='subcategories',
        verbose_name="Родительская категория"
    )
    transaction_type = models.ForeignKey(
        TransactionType,
        on_delete=models.PROTECT,
        verbose_name="Типы операции, для которых предназначена категория",
    )
    is_active = models.BooleanField(default=True, verbose_name="Активна")
    
    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ['is_active', 'name']
    
    def __str__(self):
        return self.name

class Transaction(models.Model):
    """Денежные операции"""
    creation_date = models.DateField(
        default=timezone.now,
        verbose_name="Дата создания записи", 
        help_text="Заполняется автоматически при создании"
    )
    status = models.ForeignKey(
        Status,
        on_delete=models.PROTECT,
        verbose_name="Статус"
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        verbose_name="Категория"
    )
    transaction_type = models.ForeignKey(
        TransactionType,
        on_delete=models.PROTECT,
        verbose_name="Тип операции"
    )
    absolute_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Сумма (руб)"
    )
    comment = models.TextField(
        blank=True,
        null=True,
        verbose_name="Комментарий",
        help_text="Необязательное поле"
    )
    
    class Meta:
        verbose_name = "Движение денежных средств"
        verbose_name_plural = "Движения денежных средств"
        ordering = ['-creation_date']
        indexes = [
            models.Index(fields=['creation_date']),
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['transaction_type']),
        ]
    
    def __str__(self):
        date = self.creation_date.strftime('%d.%m.%Y')
        return f"{self.amount}₽ {self.category} {date}"
    
    @property
    def amount(self):
        """Возвращает числовое значение суммы с правильным знаком"""
        if self.transaction_type.is_positive:
            return self.absolute_amount
        else:
            return -self.absolute_amount