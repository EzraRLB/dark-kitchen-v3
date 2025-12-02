# users/urls.py
from django.urls import path
from .views import (
    PinLoginView,
    AdminTokenObtainPairView,
    TeamUserListCreateView,
    TeamUserDetailView,
    ResetPinView,
)

urlpatterns = [
    path("token/pin/", PinLoginView.as_view(), name="token-pin"),
    path("token/admin/", AdminTokenObtainPairView.as_view(), name="token-admin"),

    path("team/", TeamUserListCreateView.as_view(), name="team-users"),
    path("team/<int:pk>/", TeamUserDetailView.as_view(), name="team-users-detail"),
    
    path('team/', TeamUserListCreateView.as_view(), name='team-list-create'),
    path('team/<int:pk>/', TeamUserDetailView.as_view(), name='team-detail'),

    path('team/<int:pk>/reset-pin/', ResetPinView.as_view(), name='team-reset-pin'),
]
