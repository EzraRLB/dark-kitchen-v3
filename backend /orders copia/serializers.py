from rest_framework import serializers
from django.db import transaction
from .models import Order, OrderItem
from inventory.models import Producto

class OrderItemSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'producto', 'producto_nombre', 'cantidad', 'precio_unitario']
        extra_kwargs = {'precio_unitario': {'read_only': True}}

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'created_at', 'status', 'total', 'items']
        extra_kwargs = {'total': {'read_only': True}}

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Transacción Atómica: O se hace todo (orden + descuento inventario) o no se hace nada
        with transaction.atomic():
            order = Order.objects.create(**validated_data)
            total_order = 0

            for item_data in items_data:
                producto = item_data['producto']
                cantidad_venta = item_data['cantidad']
                precio = producto.precio
                
                # 1. Crear el item de la orden
                OrderItem.objects.create(
                    order=order, 
                    producto=producto, 
                    cantidad=cantidad_venta,
                    precio_unitario=precio
                )
                total_order += (precio * cantidad_venta)

                # 2. DESCONTAR DEL INVENTARIO
                receta = producto.ingredientes_receta.all()
                for componente in receta:
                    insumo = componente.ingrediente
                    cantidad_necesaria = componente.cantidad * cantidad_venta
                    
                    # Restamos directamente.
                    insumo.stock -= cantidad_necesaria
                    insumo.save()
            
            # Guardamos el total calculado
            order.total = total_order
            order.save()
            
            return order