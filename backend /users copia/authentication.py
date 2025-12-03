# backend/users/authentication.py

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

class EmailOrUsernameBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            # Intenta encontrar al usuario por username
            user = UserModel.objects.get(username__iexact=username)
        except UserModel.DoesNotExist:
            try:
                # Si no lo encuentra, intenta por email
                user = UserModel.objects.get(email__iexact=username)
            except UserModel.DoesNotExist:
                # Si no lo encuentra de ninguna forma, la autenticación falla
                return None

        # Si se encontró un usuario, verifica su contraseña
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None