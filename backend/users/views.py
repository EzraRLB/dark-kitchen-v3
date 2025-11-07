from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils.crypto import get_random_string
from django.core.mail import send_mail

from .models import User
from .serializers import PinLoginSerializer, TeamUserSerializer


class PinLoginView(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        # 👇 tu frontend manda "pin", aquí lo traducimos
        if "user_pin" not in data and "pin" in data:
            data["user_pin"] = data["pin"]

        serializer = PinLoginSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class AdminTokenObtainPairView(TokenObtainPairView):
    pass


class TeamUserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by("id")
    serializer_class = TeamUserSerializer
    permission_classes = [permissions.IsAdminUser] 

    def perform_create(self, serializer):
        new_pin = get_random_string(length=6, allowed_chars='0123456789')
        
        role = self.request.data.get("user_role")

        is_admin = (role == 'admin')
        
        user = serializer.save(
            user_role=role,
            is_staff=is_admin,       
            is_superuser=is_admin,   
            user_pin=new_pin         
        )
        
        user.set_password(new_pin)
        user.save()

        try:
            send_mail(
                '¡Bienvenido! Aquí está tu PIN de acceso', 
                f'Hola {user.first_name},\n\n'
                f'Se ha creado tu cuenta para el sistema Dark Kitchen.\n'
                f'Tu PIN de acceso es: {new_pin}\n\n'
                'Guárdalo en un lugar seguro.\n', 
                'no-reply@darkkitchen.com', 
                [user.email], 
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error al enviar email de PIN: {e}")


class TeamUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = TeamUserSerializer
    permission_classes = [permissions.IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        user_to_delete = self.get_object()
        requesting_user = request.user

        is_admin_delete = user_to_delete.is_superuser or user_to_delete.user_role in ['admin', 'supervisor']

        if not is_admin_delete:
            self.perform_destroy(user_to_delete)
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        admin_password = request.data.get('admin_password')

        if not admin_password:
            return Response(
                {'error': 'Para eliminar un administrador, debe proporcionar su propia contraseña para confirmar. '},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not requesting_user.check_password(admin_password):
            return Response(
                {'error': 'Contraseña de administrador incorrecta. Eliminación cancelada.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        self.perform_destroy(user_to_delete)
        return Response(status=status.HTTP_204_NO_CONTENT)

class ResetPinView(APIView):
    """
    Vista para que un admin restablezca el PIN de otro usuario.
    Requiere la contraseña del admin que hace la petición.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk, *args, **kwargs):
        requesting_user = request.user
        
        admin_password = request.data.get('admin_password')

        if not admin_password:
            return Response(
                {'error': 'Se requiere su contraseña de administrador para confirmar esta acción.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not requesting_user.check_password(admin_password):
            return Response(
                {'error': 'Contraseña de administrador incorrecta.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            user_to_reset = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        new_pin = get_random_string(length=6, allowed_chars='0123456789')
        
        user_to_reset.set_password(new_pin) 
        user_to_reset.user_pin = new_pin   
        user_to_reset.save()

        try:
            send_mail(
                '¡Tu PIN de acceso ha sido restablecido!', 
                f'Hola {user_to_reset.first_name},\n\n'
                f'Un administrador ha restablecido tu PIN de acceso para el sistema Dark Kitchen.\n'
                f'Tu NUEVO PIN de acceso es: {new_pin}\n\n'
                'Guárdalo en un lugar seguro.\n', 
                'no-reply@darkkitchen.com', 
                [user_to_reset.email], 
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error al enviar email de PIN restablecido: {e}")

        return Response(
            {'success': f'Se ha restablecido el PIN para {user_to_reset.username} y se ha enviado por correo.'},
            status=status.HTTP_200_OK
        )