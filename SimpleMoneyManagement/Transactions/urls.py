from django.urls import include, path
from rest_framework import routers

import Transactions.views

router = routers.DefaultRouter()
router.register(r'statuses', Transactions.views.StatusViewSet)
router.register(r'transaction-types', Transactions.views.TransactionTypeViewSet)
router.register(r'categories', Transactions.views.CategoryViewSet)
router.register(r'transactions', Transactions.views.TransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]