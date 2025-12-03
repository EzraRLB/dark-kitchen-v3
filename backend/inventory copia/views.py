from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import UnidadMedida, Ingrediente
from .serializers import UnidadMedidaSerializer, IngredienteSerializer

class UnidadMedidaViewSet(viewsets.ModelViewSet):
    queryset = UnidadMedida.objects.all()
    serializer_class = UnidadMedidaSerializer
    permission_classes = [IsAuthenticated]

class IngredienteViewSet(viewsets.ModelViewSet):
    queryset = Ingrediente.objects.select_related('unidad_base_consumo', 'unidad_compra').all()
    serializer_class = IngredienteSerializer
    permission_classes = [IsAuthenticated]