import django_filters
from Transactions.models import Transaction

class TransactionFilter(django_filters.FilterSet):
    creation_date = django_filters.DateFromToRangeFilter()
    
    class Meta:
        model = Transaction
        fields = {
            'creation_date': ['exact', 'range'],
            'status': ['exact'],
            'transaction_type': ['exact'],
            'category': ['exact'],
        }