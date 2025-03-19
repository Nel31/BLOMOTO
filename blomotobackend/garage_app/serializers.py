from rest_framework import serializers
from .models import Garage

class GarageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Garage
        fields = ('name', 'address', 'phone_number', 'service')