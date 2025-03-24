from rest_framework import serializers
from .models import Service

class ServiceSerializer(serializers.ModelSerializer):
    garages = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'name', 'service_picture', 'comment', 'garages']