import random
from django.core.management.base import BaseCommand
from django.db import transaction
from inventory.models import Producto, Ingrediente
from orders.models import Order, OrderItem

class Command(BaseCommand):
    help = 'Crea UNA orden nueva en tiempo real para probar el KDS'

    def handle(self, *args, **options):
        try:
            with transaction.atomic():
                # Obtener productos disponibles
                productos = list(Producto.objects.filter(disponible=True))
                if not productos:
                    self.stdout.write(self.style.ERROR('No hay productos en el menú. Corre simulate_kitchen primero.'))
                    return

                # Crear la orden
                order = Order.objects.create(status='nuevo') # Status inicial
                
                total = 0
                items_creados = []

                # Agregar entre 1 y 4 productos aleatorios
                for _ in range(random.randint(1, 4)):
                    prod = random.choice(productos)
                    qty = random.randint(1, 3)
                    
                    OrderItem.objects.create(
                        order=order, 
                        producto=prod, 
                        cantidad=qty, 
                        precio_unitario=prod.precio
                    )
                    total += (prod.precio * qty)
                    items_creados.append(f"{qty}x {prod.nombre}")

                    # Descontar Inventario
                    for receta in prod.ingredientes_receta.all():
                        insumo = receta.ingrediente
                        insumo.stock -= (receta.cantidad * qty)
                        insumo.save()

                order.total = total
                order.save()

                self.stdout.write(self.style.SUCCESS(f'¡Nueva orden #{order.id} creada!'))
                self.stdout.write(f'Items: {", ".join(items_creados)}')
                self.stdout.write(f'Total: ${total}')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creando orden: {str(e)}'))