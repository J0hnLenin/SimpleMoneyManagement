from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from rest_framework.response import Response
from rest_framework.views import APIView
import SimpleMoneyManagement.views

class RootView(APIView):
    """
    Root REST API
    """
    def get(self, request, *args, **kwargs):
        apidocs = {'Main API': request.build_absolute_uri('main/'),
                   'Transactions API': request.build_absolute_uri('transactions/')
                   }
        return Response(apidocs)

router = routers.DefaultRouter()
router.register('users', SimpleMoneyManagement.views.UserViewSet)
router.register('groups', SimpleMoneyManagement.views.GroupViewSet)

api_version = 1
prefix = 'api'

urlpatterns = [
        path(f'{prefix}/v{api_version}/', RootView.as_view()),
        path(f'{prefix}/v{api_version}/main/', include(router.urls)),
        path(f'{prefix}/v{api_version}/transactions/', include('Transactions.urls')),
        path('', admin.site.urls),
    ]