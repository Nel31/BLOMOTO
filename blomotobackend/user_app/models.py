from django.db import models
from django.contrib.auth.models import AbstractUser
from garage_app.models import Garage
from service_app.models import Service

class CustomUser(AbstractUser):
    birth_date = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='users_pictures/', blank=True, null=True)

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "User"

class Avis(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='avis')
    garage = models.ForeignKey(Garage, on_delete=models.CASCADE, related_name='avis')
    rating = models.PositiveIntegerField(choices=[(1, '1 étoile'), (2, '2 étoiles'), (3, '3 étoiles'), (4, '4 étoiles'), (5, '5 étoiles')])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Avis de {self.user.username} pour {self.garage.name}'
    class Meta:
        verbose_name = "Avis"
        verbose_name_plural = "Avis"

class RendezVous(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='rendezvous')
    garage = models.ForeignKey(Garage, on_delete=models.CASCADE, related_name='rendezvous')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='rendezvous')
    appointment_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=[('scheduled', 'Programmé'), ('completed', 'Terminé'), ('canceled', 'Annulé')], default='scheduled')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Rendez-vous de {self.user.username} chez {self.garage.name} le {self.appointment_date}'

    class Meta:
        verbose_name = "Rendez-vous"
        verbose_name_plural = "Rendez-vous"

