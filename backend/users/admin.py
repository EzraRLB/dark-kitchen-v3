# backend/users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Creamos una clase para personalizar el admin
class CustomUserAdmin(UserAdmin):
    # Campos que se mostrarán en la lista de usuarios
    list_display = (
        'username', 
        'email', 
        'first_name', 
        'last_name', 
        'user_role', 
        'user_alies'
    )
    
    # Hacemos que los campos personalizados sean editables
    # (Añadimos nuestros campos a los fieldsets por defecto de UserAdmin)
    fieldsets = UserAdmin.fieldsets + (
        ('Campos Personalizados', {'fields': ('user_role', 'user_alies', 'user_pin')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Campos Personalizados', {'fields': ('user_role', 'user_alies', 'user_pin')}),
    )

# Registramos nuestro modelo User con la configuración personalizada
admin.site.register(User, CustomUserAdmin)