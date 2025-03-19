from rest_framework import generics
from django.shortcuts import render
from .models import Garage
from .serializers import GarageSerializer

class GarageCreateView(generics.CreateAPIView):
    queryset = Garage.objects.all()
    serializer_class = GarageSerializer

class GarageListView(generics.ListAPIView):
    queryset = Garage.objects.all()
    serializer_class = GarageSerializer

class GarageDetailView(generics.RetrieveAPIView):
    queryset = Garage.objects.all()
    serializer_class = GarageSerializer


class GarageUpdateView(generics.UpdateAPIView):
    queryset = Garage.objects.all()
    serializer_class = GarageSerializer

class GarageDeleteView(generics.RetrieveDestroyAPIView):
    queryset = Garage.objects.all()
    serializer_class = GarageSerializer
