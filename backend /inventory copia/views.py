from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import UnidadMedida, Ingrediente, Producto
from .serializers import UnidadMedidaSerializer, IngredienteSerializer, ProductoSerializer

class UnidadMedidaViewSet(viewsets.ModelViewSet):
    queryset = UnidadMedida.objects.all()
    serializer_class = UnidadMedidaSerializer
    # permission_classes = [IsAuthenticated] # Descomenta si usas login estricto

class IngredienteViewSet(viewsets.ModelViewSet):
    queryset = Ingrediente.objects.select_related('unidad_base_consumo', 'unidad_compra').all()
    serializer_class = IngredienteSerializer
    # permission_classes = [IsAuthenticated]

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.prefetch_related('ingredientes_receta__ingrediente').all()
    serializer_class = ProductoSerializer
    # permission_classes = [IsAuthenticated]