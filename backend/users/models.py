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
    
    user_role = models.CharField(max_length=20, choices=USER_ROLE_CHOICES, blank=True)
    user_pin = models.CharField(max_length=128, help_text="Este campo es solo para establecer/cambiar el PIN. No se almacena en texto plano.")
    user_alias = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True)
    
    def save(self, *args, **kwargs):
        # Hashear el PIN y guardarlo en el campo 'password' de Django.
        if self.user_pin:
            self.password = make_password(self.user_pin)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username