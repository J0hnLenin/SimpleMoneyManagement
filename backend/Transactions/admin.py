from django.contrib import admin
from .models import *

@admin.register(Status)
class StatusAdmin(admin.ModelAdmin):
   list_display = ['name', 'is_active']
   list_editable = ['is_active']
   list_filter = ['is_active']
   search_fields = ['name']

@admin.register(TransactionType)
class TransactionTypeAdmin(admin.ModelAdmin):
   list_display = ['name', "is_positive", 'is_active']
   list_editable = ['is_active']
   list_filter = ['is_active']
   search_fields = ['name']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'is_active']
    list_editable = ['is_active']
    list_filter = ['is_active', 'parent']
    search_fields = ['name']
    list_select_related = ['parent']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['amount_display', 'category', 'status', 'creation_date']
    list_filter = ['creation_date', 'transaction_type', 'category', 'status']
    search_fields = ['status__name', 'category__name', 'creation_date']
    date_hierarchy = 'creation_date'
    list_select_related = ['transaction_type', 'category', 'status']   
    fieldsets = (
        (None, {
            'fields': ('creation_date', 'absolute_amount', 'transaction_type')
        }),
        ('Детали операции', {
            'fields': ('category', 'status', 'comment')
        }),
    )   
    
    def amount_display(self, obj):
        return obj.amount   
    
    amount_display.short_description = "Сумма" # type: ignore