from django.db import models

class Service(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    service_picture = models.ImageField(upload_to='services_pictures/', blank=True, null=True)
    comment = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Service"
        verbose_name_plural = "Service"

class Category(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    service = models.ManyToManyField(Service, related_name="categorie", blank=True)

    class Meta:
        verbose_name = "Categorie"
        verbose_name_plural = "Categorie"

    def __str__(self):
        return self.name