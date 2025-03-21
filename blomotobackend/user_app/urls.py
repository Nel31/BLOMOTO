from django.urls import path
from .views import CustomUserRegisterView, CustomUserDetailView, CustomUserListView, CustomUserUpdateView, CustomUserDeleteView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('register/', CustomUserRegisterView.as_view(), name='user-register'),
    path('login/', obtain_auth_token, name='api_token_auth'),
    path('users/', CustomUserListView.as_view(), name='list_user'),
    path('users/create/', CustomUserRegisterView.as_view(), name='create_user'),
    path('users/<int:pk>/', CustomUserDetailView.as_view(), name='user_detail'),
    path('users/<int:pk>/update/', CustomUserUpdateView.as_view(), name='update_user'),
    path('users/<int:pk>/delete/', CustomUserDeleteView.as_view(), name='delete_user'),
]