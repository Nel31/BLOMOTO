from django.urls import path
from .views import CustomUserCreateView, CustomUserDetailView, CustomUserListView, CustomUserUpdateView, CustomUserDeleteView

urlpatterns = [
    path('users/', CustomUserListView.as_view(), name='list_user'),
    path('users/create/', CustomUserCreateView.as_view(), name='create_user'),
    path('users/<int:pk>/', CustomUserDetailView.as_view(), name='user_detail'),
    path('users/<int:pk>/update/', CustomUserUpdateView.as_view(), name='update_user'),
    path('users/<int:pk>/delete/', CustomUserDeleteView.as_view(), name='delete_user'),
]