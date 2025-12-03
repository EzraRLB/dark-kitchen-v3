from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class PinLoginSerializer(serializers.Serializer):
    user_pin = serializers.CharField(max_length=6)

    def validate(self, data):
        pin = data.get('user_pin')
        try:
            user_found = None
            for user in User.objects.all():
                if user.check_password(pin):
                    user_found = user
                    break
            if not user_found:
                raise serializers.ValidationError("PIN inválido.")
        except User.DoesNotExist:
            raise serializers.ValidationError("PIN inválido.")

        refresh = RefreshToken.for_user(user_found)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user_found.id,
                'username': user_found.username,
                'user_alias': user_found.user_alias,
                'user_role': user_found.user_role,
            }
        }


class TeamUserSerializer(serializers.ModelSerializer):
    
    user_pin = serializers.CharField(read_only=True) 

    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'first_name', 
            'last_name', 
            'email',
            'user_role',    
            'user_alias',
            'user_pin',    
            'is_staff',     
            'is_active',
            'is_superuser'
        ]
        
        read_only_fields = ['is_staff', 'is_superuser']