from django.urls import path
from .views import CustomUserRegisterView, CustomUserLoginView, CustomUserLogoutView, CustomUserDetailView, CustomUserListView, CustomUserUpdateView, CustomUserDeleteView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', CustomUserRegisterView.as_view(), name='user-register'),
    path('login/', CustomUserLoginView.as_view(), name='login'),
    path('logout/', CustomUserLogoutView.as_view(), name='logout'),
    path('users/', CustomUserListView.as_view(), name='list_user'),
    path('users/create/', CustomUserRegisterView.as_view(), name='create_user'),
    path('users/<int:pk>/', CustomUserDetailView.as_view(), name='user_detail'),
    path('users/<int:pk>/update/', CustomUserUpdateView.as_view(), name='update_user'),
    path('users/<int:pk>/delete/', CustomUserDeleteView.as_view(), name='delete_user'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]