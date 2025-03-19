from rest_framework import serializers
from .models import CustomUser, Avis, RendezVous

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('username', 'first_name', 'last_name', 'birth_date', 'phone_number', 
                  'email', 'password', 'profile_picture', 'is_active', 'is_staff',
                  'date_joined', 'last_login')


class AvisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avis
        fields = ['user', 'garage', 'rating', 'comment']


class RendezVousSerializer(serializers.ModelSerializer):
    class Meta:
        model = RendezVous
        fields = ['user', 'garage', 'service', 'appointment_date', 'status', 'created_at']