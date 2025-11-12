from django.contrib import admin
from .models import UnidadMedida, Ingrediente

@admin.register(UnidadMedida)
class UnidadMedidaAdmin(admin.ModelAdmin):
    list_display = ('nombre_um', 'abreviacion_um', 'tipo_um', 'es_unidad_base', 'factor_conversion')
    list_filter = ('tipo_um', 'es_unidad_base')
    search_fields = ('nombre_um', 'abreviacion_um')

@admin.register(Ingrediente)
class IngredienteAdmin(admin.ModelAdmin):
    list_display = ('nombre_ingrediente', 'tipo_articulo', 'unidad_base_consumo', 'unidad_compra')
    list_filter = ('tipo_articulo',)
    search_fields = ('nombre_ingrediente',)