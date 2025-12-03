from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, DashboardReportView

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/dashboard/', DashboardReportView.as_view(), name='dashboard-report'),
]