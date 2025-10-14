# backend/users/urls.py

from django.urls import path
from .views import PinLoginView, AdminTokenObtainPairView

urlpatterns = [
    path('token/pin/', PinLoginView.as_view(), name='token_obtain_pin'),
    path('token/admin/', AdminTokenObtainPairView.as_view(), name='token_obtain_admin'),
]
