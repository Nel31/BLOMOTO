from django.db import models
from service_app.models import Category

class Garage(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    address = models.CharField(max_length=200, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    categorie = models.ManyToManyField(Category, related_name="garage", blank=True)

    class Meta:
        verbose_name = "Garage"
        verbose_name_plural = "Garage"