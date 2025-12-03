import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from inventory.models import UnidadMedida, Ingrediente, Producto, Receta
from orders.models import Order, OrderItem

class Command(BaseCommand):
    help = 'Genera datos de prueba: Insumos, Menú y Ventas Históricas'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Iniciando simulación...'))

        with transaction.atomic():
            # 1. Unidades de Medida
            u_gr, _ = UnidadMedida.objects.get_or_create(nombre_um="Gramos", abreviacion_um="g", tipo_um="Peso", factor_conversion=1)
            u_pz, _ = UnidadMedida.objects.get_or_create(nombre_um="Pieza", abreviacion_um="pz", tipo_um="Unidad", factor_conversion=1)

            # 2. Insumos (Inventario Inicial)
            insumos_data = [
                ("Carne Molida", u_gr, 50000),      # 50kg
                ("Pan Hamburguesa", u_pz, 200),     # 200 pzas
                ("Queso Cheddar", u_pz, 200),
                ("Papas Congeladas", u_gr, 20000),  # 20kg
                ("Refresco Cola", u_pz, 100),
                ("Lechuga", u_gr, 5000),
            ]
            
            insumos_objs = {}
            for nombre, unidad, stock in insumos_data:
                ing, _ = Ingrediente.objects.get_or_create(
                    nombre_ingrediente=nombre,
                    defaults={
                        'unidad_base_consumo': unidad, 'unidad_compra': unidad,
                        'tipo_articulo': 'INSUMO_RECETA', 'stock': stock
                    }
                )
                ing.stock = stock # Reseteamos stock
                ing.save()
                insumos_objs[nombre] = ing
            
            # 3. Productos (Menú)
            menu_data = [
                ("Hamburguesa Clásica", 120.00), ("Hamburguesa Doble", 160.00),
                ("Papas Fritas", 45.00), ("Refresco", 25.00),
            ]
            
            productos_objs = {}
            for nombre, precio in menu_data:
                prod, _ = Producto.objects.get_or_create(nombre=nombre, defaults={'precio': precio})
                productos_objs[nombre] = prod

            # 4. Recetas (Limpiamos y creamos)
            Receta.objects.all().delete()
            Receta.objects.create(producto=productos_objs["Hamburguesa Clásica"], ingrediente=insumos_objs["Pan Hamburguesa"], cantidad=1)
            Receta.objects.create(producto=productos_objs["Hamburguesa Clásica"], ingrediente=insumos_objs["Carne Molida"], cantidad=150)
            Receta.objects.create(producto=productos_objs["Hamburguesa Doble"], ingrediente=insumos_objs["Carne Molida"], cantidad=300)
            Receta.objects.create(producto=productos_objs["Papas Fritas"], ingrediente=insumos_objs["Papas Congeladas"], cantidad=200)

            # 5. Ventas Históricas (Últimos 10 días)
            self.stdout.write("Generando ventas...")
            Order.objects.all().delete()
            
            end_date = timezone.now()
            start_date = end_date - timedelta(days=10)
            current = start_date
            
            while current <= end_date:
                daily_orders = random.randint(5, 12)
                for _ in range(daily_orders):
                    order = Order.objects.create(status='entregado')
                    order.created_at = current + timedelta(hours=random.randint(12, 22))
                    
                    total = 0
                    for _ in range(random.randint(1, 3)):
                        prod = random.choice(list(productos_objs.values()))
                        qty = random.randint(1, 2)
                        OrderItem.objects.create(order=order, producto=prod, cantidad=qty, precio_unitario=prod.precio)
                        total += (prod.precio * qty)
                        
                        # Descontar inventario
                        for receta in prod.ingredientes_receta.all():
                            insumo = receta.ingrediente
                            insumo.stock -= (receta.cantidad * qty)
                            insumo.save()
                    
                    order.total = total
                    order.save()
                current += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS('¡Simulación completada!'))