from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UnidadMedidaViewSet, IngredienteViewSet

router = DefaultRouter()
router.register(r'unidades-medida', UnidadMedidaViewSet)
router.register(r'ingredientes', IngredienteViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]