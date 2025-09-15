from django.urls import include, path
from django.contrib import admin
from rest_framework import routers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
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
        path(f'admin/', admin.site.urls),
        path(f'{prefix}/v{api_version}/', RootView.as_view()),
        path(f'{prefix}/v{api_version}/main/', include(router.urls)),
        path(f'{prefix}/v{api_version}/transactions/', include('Transactions.urls')),
        path(f'{prefix}/v{api_version}/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path(f'{prefix}/v{api_version}/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    ]