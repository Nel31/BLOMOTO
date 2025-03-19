from django.urls import path
from .views import ServiceCreateView, ServiceDetailView, ServiceListView, ServiceUpdateView, ServiceDeleteView

urlpatterns = [
    path('services/', ServiceListView.as_view(), name='list_service'),
    path('services/create/', ServiceCreateView.as_view(), name='create_service'),
    path('services/<int:pk>/', ServiceDetailView.as_view(), name='service_detail'),
    path('services/<int:pk>/update/', ServiceUpdateView.as_view(), name='update_service'),
    path('services/<int:pk>/delete/', ServiceDeleteView.as_view(), name='delete_service'),
]