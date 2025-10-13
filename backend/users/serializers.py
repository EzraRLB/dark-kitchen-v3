# users/serializers.py
from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken

class PinLoginSerializer(serializers.Serializer):
    user_pin = serializers.CharField(max_length=6)

    def validate(self, data):
        pin = data.get('user_pin')
        try:
            user = User.objects.get(user_pin=pin)
        except User.DoesNotExist:
            raise serializers.ValidationError("PIN inválido.")

        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'user_id': user.user_id,
                'user_role': user.user_role,
                'tenant_id': user.tenant_id,
                'user_first_name': user.user_first_name,
                'user_last_name': user.user_last_name,
                'user_alias': user.user_alias,
                'kitchen_id': user.kitchen_id,
            }
        }

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = ['user_id']
