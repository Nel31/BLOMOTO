from rest_framework import serializers
from .models import Garage
from service_app.serializers import ServiceSerializer

class GarageSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = Garage
        fields = ['name', 'address', 'phone_number', 'services']