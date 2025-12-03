from rest_framework import serializers
from .models import UnidadMedida, Ingrediente, Producto, Receta

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

# NUEVOS SERIALIZERS

class RecetaSerializer(serializers.ModelSerializer):
    ingrediente_nombre = serializers.CharField(source='ingrediente.nombre_ingrediente', read_only=True)
    unidad = serializers.CharField(source='ingrediente.unidad_base_consumo.abreviacion_um', read_only=True)

    class Meta:
        model = Receta
        fields = ['id', 'ingrediente', 'ingrediente_nombre', 'cantidad', 'unidad']

class ProductoSerializer(serializers.ModelSerializer):
    # Incluimos la receta anidada para verla fácilmente
    ingredientes = RecetaSerializer(source='ingredientes_receta', many=True, read_only=True)

    class Meta:
        model = Producto
        fields = '__all__'