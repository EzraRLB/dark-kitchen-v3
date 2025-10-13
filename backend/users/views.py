# backend/users/views.py

from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

class PinLoginView(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        pin = request.data.get('pin')

        if not username or not pin:
            return Response({'error': 'Se requiere "username" y "pin"'}, status=status.HTTP_400_BAD_REQUEST)

        # Usamos el sistema de autenticación de Django
        # que comparará el PIN (enviado como password) con el hash en la BD
        user = authenticate(username=username, password=pin)

        if user:
            # Si la autenticación es exitosa, generamos los tokens JWT
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'user_alies': user.user_alies,
                    'user_role': user.user_role,
                }
            })
        
        return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)