from rest_framework import permissions, viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from Transactions.models import Status, TransactionType, Category, Transaction
from Transactions.serializers import (
    StatusSerializer, 
    TransactionTypeSerializer, 
    CategorySerializer, 
    TransactionSerializer
)
from Transactions.filters import TransactionFilter

class StatusViewSet(viewsets.ModelViewSet):
    """
    API endpoint позволяющий просматривать и редактировать статусы.
    """
    queryset = Status.objects.all()
    serializer_class = StatusSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name']
    ordering_fields = ['name', 'is_active']
    
class TransactionTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint позволяющий просматривать и редактировать типы транзакций.
    """
    queryset = TransactionType.objects.all()
    serializer_class = TransactionTypeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name']
    ordering_fields = ['name', 'is_active']

class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint позволяющий просматривать и редактировать категории и подкатегории.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name']
    ordering_fields = ['name', 'is_active']

class TransactionViewSet(viewsets.ModelViewSet):
    """
    API endpoint позволяющий просматривать и редактировать денежные операции.
    """
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TransactionFilter
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['comment', 'category__name', 'status__name']
    ordering_fields = ['creation_date', 'absolute_amount']
    ordering = ['-creation_date']