from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils.crypto import get_random_string

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
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        password = (
            self.request.data.get("password")
            or self.request.data.get("user_pin")
            or get_random_string(10)
        )
        user = serializer.save()
        user.set_password(password)
        user.save()


class TeamUserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = TeamUserSerializer
    permission_classes = [permissions.IsAuthenticated]
