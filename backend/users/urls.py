# backend/users/urls.py

from django.urls import path
from .views import PinLoginView

urlpatterns = [
    path('token/pin/', PinLoginView.as_view(), name='token_obtain_pin'),
]
