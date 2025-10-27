# backend/users/urls.py

from django.urls import path
from .views import PinLoginView, AdminTokenObtainPairView, TeamUserList, TeamUserDetail

urlpatterns = [
    path('token/pin/', PinLoginView.as_view(), name='token_obtain_pin'),
    path('token/admin/', AdminTokenObtainPairView.as_view(), name='token_obtain_admin'),

    # Endpoints used by the frontend team management view
    path('team/', TeamUserList.as_view(), name='team_list'),
    path('team/<int:pk>/', TeamUserDetail.as_view(), name='team_detail'),
]
