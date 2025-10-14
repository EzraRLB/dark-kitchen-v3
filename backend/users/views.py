from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class AdminTokenObtainPairView(TokenObtainPairView):
    pass

class PinLoginView(APIView):
    def post(self, request, *args, **kwargs):
        pin = request.data.get('pin')

        if not pin:
            return Response({'error': 'Se requiere "pin"'}, status=status.HTTP_400_BAD_REQUEST)

        user_found = None
        for user in User.objects.all():
            if user.check_password(pin):
                user_found = user
                break

        if user_found:
            refresh = RefreshToken.for_user(user_found)
            return Response({
                'access': str(refresh.access_token),
                'user': {
                    'id': user_found.id,
                    'username': user_found.username,
                    'user_alias': user_found.user_alias,
                    'user_role': user_found.user_role,
                }
            })
        
        return Response({'error': 'PIN inválido'}, status=status.HTTP_401_UNAUTHORIZED)