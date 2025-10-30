from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class PinLoginSerializer(serializers.Serializer):
    user_pin = serializers.CharField(max_length=6)

    def validate(self, data):
        pin = data.get("user_pin")

        # puede haber más de un user con el mismo pin → agarro el primero
        user = User.objects.filter(user_pin=pin).first()
        if not user:
            raise serializers.ValidationError("PIN inválido.")

        # generar token
        refresh = RefreshToken.for_user(user)

        # devolver datos pero SIN reventar si falta un campo
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                # si tu modelo tiene user_id lo manda, si no manda el id normal
                "user_id": getattr(user, "user_id", getattr(user, "id", None)),
                "id": getattr(user, "id", None),
                "user_role": getattr(user, "user_role", None),
                "tenant_id": getattr(user, "tenant_id", None),
                # intenta con tus campos raros y si no, con los de Django
                "user_first_name": getattr(
                    user, "user_first_name", getattr(user, "first_name", "")
                ),
                "user_last_name": getattr(
                    user, "user_last_name", getattr(user, "last_name", "")
                ),
                # alias: si no hay, usa username
                "user_alias": getattr(user, "user_alias", getattr(user, "username", "")),
                "kitchen_id": getattr(user, "kitchen_id", None),
            },
        }


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
        read_only_fields = ["user_id"]


class TeamUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "unit",
            "user_pin",
        )
        extra_kwargs = {
            "username": {"required": True},
            "email": {"required": True},
        }
