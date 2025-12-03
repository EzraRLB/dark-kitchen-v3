from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UnidadMedidaViewSet, IngredienteViewSet, ProductoViewSet

router = DefaultRouter()
router.register(r'unidades-medida', UnidadMedidaViewSet)
router.register(r'ingredientes', IngredienteViewSet)
router.register(r'productos', ProductoViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]