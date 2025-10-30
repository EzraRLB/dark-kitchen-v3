# users/urls.py
from django.urls import path
from .views import (
    PinLoginView,
    AdminTokenObtainPairView,
    TeamUserListCreateView,
    TeamUserDetailView,
)

urlpatterns = [
    path("token/pin/", PinLoginView.as_view(), name="token-pin"),
    path("token/admin/", AdminTokenObtainPairView.as_view(), name="token-admin"),

    path("team/", TeamUserListCreateView.as_view(), name="team-users"),
    path("team/<int:pk>/", TeamUserDetailView.as_view(), name="team-users-detail"),
]
