from django.contrib import admin
from .models import Service, Category

class ServiceAdmin(admin.ModelAdmin):
    model = Service
    list_display = ('name',)

class CategoryAdmin(admin.ModelAdmin):
    model = Category
    list_display = ('name',)
    filter_horizontal = ('service',)

admin.site.register(Service, ServiceAdmin)
admin.site.register(Category, CategoryAdmin)