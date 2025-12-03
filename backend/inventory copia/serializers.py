from rest_framework import serializers
from .models import UnidadMedida, Ingrediente

class UnidadMedidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadMedida
        fields = '__all__'

class IngredienteSerializer(serializers.ModelSerializer):
    unidad_base_consumo_nombre = serializers.CharField(source='unidad_base_consumo.nombre_um', read_only=True)
    unidad_compra_nombre = serializers.CharField(source='unidad_compra.nombre_um', read_only=True)
    
    class Meta:
        model = Ingrediente
        fields = '__all__'