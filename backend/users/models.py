# backend/users/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.hashers import make_password

class User(AbstractUser):
    USER_ROLE_CHOICES = [
        ('cocinero', 'Cocinero'),
        ('empacador', 'Empacador'),
        ('supervisor', 'Supervisor'),
        ('admin', 'Administrador'),
    ]
    
    # Atributos de tu entidad
    # El User_ID (PK) y User_password ya vienen en AbstractUser
    user_role = models.CharField(max_length=20, choices=USER_ROLE_CHOICES)
    
    # Asumo que tendrás modelos para Tenant y Kitchen en otras apps
    # Si no, puedes cambiarlos a CharField o IntegerField por ahora
    # tenant_id = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    # kitchen_id = models.ForeignKey('kitchens.Kitchen', on_delete=models.SET_NULL, null=True, blank=True)
    
    user_pin = models.CharField(max_length=128, help_text="Este campo es solo para establecer/cambiar el PIN. No se almacena en texto plano.")
    user_alies = models.CharField(max_length=50, blank=True, null=True)
    
    # Hacemos que el email no sea obligatorio para el login
    email = models.EmailField(blank=True)
    
    def save(self, *args, **kwargs):
        # ¡IMPORTANTE! Hashear el PIN y guardarlo en el campo 'password' de Django.
        if self.user_pin:
            self.password = make_password(self.user_pin)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username