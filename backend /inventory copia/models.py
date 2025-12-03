from django.db import models

class UnidadMedida(models.Model):
    TIPO_CHOICES = [
        ('Volumen', 'Volumen'),
        ('Peso', 'Peso'),
        ('Unidad', 'Unidad'),
    ]
    
    id_um = models.AutoField(primary_key=True)
    nombre_um = models.CharField(max_length=50)
    abreviacion_um = models.CharField(max_length=5)
    tipo_um = models.CharField(max_length=20, choices=TIPO_CHOICES)
    es_unidad_base = models.BooleanField(default=False)
    factor_conversion = models.DecimalField(max_digits=10, decimal_places=4)
    
    class Meta:
        db_table = 'unidad_medida'
        verbose_name = 'Unidad de Medida'
        verbose_name_plural = 'Unidades de Medida'
    
    def __str__(self):
        return f"{self.nombre_um} ({self.abreviacion_um})"

class Ingrediente(models.Model):
    TIPO_ARTICULO_CHOICES = [
        ('INSUMO_RECETA', 'Insumo de Receta'),
        ('EMPAQUE', 'Empaque'),
        ('CONDIMENTO_INCLUIDO', 'Condimento Incluido'),
    ]
    
    id_ingrediente = models.AutoField(primary_key=True)
    nombre_ingrediente = models.CharField(max_length=50)
    unidad_base_consumo = models.ForeignKey(
        UnidadMedida, 
        on_delete=models.PROTECT, 
        related_name='ingredientes_consumo'
    )
    unidad_compra = models.ForeignKey(
        UnidadMedida, 
        on_delete=models.PROTECT, 
        related_name='ingredientes_compra'
    )
    tipo_articulo = models.CharField(max_length=20, choices=TIPO_ARTICULO_CHOICES)
    
    # NUEVO: Campo de Stock
    stock = models.DecimalField(max_digits=12, decimal_places=4, default=0.0000, help_text="Cantidad disponible en la unidad base de consumo")
    
    class Meta:
        db_table = 'ingrediente'
        verbose_name = 'Ingrediente'
        verbose_name_plural = 'Ingredientes'
    
    def __str__(self):
        return self.nombre_ingrediente

# NUEVOS MODELOS: Menú y Recetas

class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.TextField(blank=True, null=True)
    disponible = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

class Receta(models.Model):
    producto = models.ForeignKey(Producto, related_name='ingredientes_receta', on_delete=models.CASCADE)
    ingrediente = models.ForeignKey(Ingrediente, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=4, help_text="Cantidad en unidad base del ingrediente")

    class Meta:
        unique_together = ('producto', 'ingrediente')

    def __str__(self):
        return f"{self.producto.nombre} - {self.ingrediente.nombre_ingrediente}"