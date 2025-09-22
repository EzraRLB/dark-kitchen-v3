# users/urls.py
from django.urls import path
from .views import RegisterAPIView, MyTokenObtainPairView, LogoutAPIView, UserProfileAPIView

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('user/', UserProfileAPIView.as_view(), name='user-profile'),
]
