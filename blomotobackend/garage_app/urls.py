from django.urls import path
from .views import GarageCreateView, GarageDetailView, GarageListView, GarageUpdateView, GarageDeleteView

urlpatterns = [
    path('garages/', GarageListView.as_view(), name='list_garage'),
    path('garages/create/', GarageCreateView.as_view(), name='create_garage'),
    path('garages/<int:pk>/', GarageDetailView.as_view(), name='garage_detail'),
    path('garages/<int:pk>/update/', GarageUpdateView.as_view(), name='update_garage'),
    path('garages/<int:pk>/delete/', GarageDeleteView.as_view(), name='delete_garage'),
]