from django.contrib import admin
from .models import Garage

class GarageAdmin(admin.ModelAdmin):
    model = Garage
    list_display = ('name', 'address', 'phone_number')
    filter_horizontal = ('service',)
    
admin.site.register(Garage, GarageAdmin)