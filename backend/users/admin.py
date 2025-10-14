from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = (
        'username', 
        'email', 
        'first_name', 
        'last_name', 
        'user_role', 
        'user_alias'
    )
    
    fieldsets = UserAdmin.fieldsets + (
        ('Campos Personalizados', {'fields': ('user_role', 'user_alias', 'user_pin')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Campos Personalizados', {'fields': ('user_role', 'user_alias', 'user_pin')}),
    )

admin.site.register(User, CustomUserAdmin)