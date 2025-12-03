from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from .models import Order, OrderItem
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    # queryset original se elimina porque usaremos get_queryset

    def get_queryset(self):
        queryset = Order.objects.all().order_by('created_at') # Las más viejas primero en KDS
        
        # Filtro para el KDS: ?kds=true
        kds_mode = self.request.query_params.get('kds', None)
        if kds_mode:
            # Solo devolver órdenes activas (no entregadas)
            return queryset.exclude(status='entregado')
            
        return queryset.order_by('-created_at') # Para el admin, las más nuevas primero
class DashboardReportView(APIView):
    """
    Entrega todos los datos necesarios para las gráficas del Dashboard
    """
    def get(self, request):
        # 1. Ventas agrupadas por día (Gráfica de Línea)
        sales_by_date = Order.objects.annotate(date=TruncDate('created_at')) \
            .values('date') \
            .annotate(orders_count=Count('id'), total_sales=Sum('total')) \
            .order_by('date')

        # 2. Top 5 Productos más vendidos (Gráfica de Barras)
        top_products = OrderItem.objects.values('producto__nombre') \
            .annotate(total_sold=Sum('cantidad')) \
            .order_by('-total_sold')[:5]

        # 3. Totales Generales (Tarjetas de resumen)
        total_revenue = Order.objects.aggregate(Sum('total'))['total__sum'] or 0
        total_orders_count = Order.objects.count()

        return Response({
            "timeline": list(sales_by_date),
            "top_products": list(top_products),
            "summary": {
                "revenue": total_revenue,
                "orders": total_orders_count
            }
        })