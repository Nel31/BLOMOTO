from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Avis, RendezVous

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'first_name', 'last_name', 'birth_date', 'phone_number', 'email', 'password', 'profile_picture', 'is_active', 'is_staff', 'date_joined', 'last_login')
    list_filter = ('is_active', 'is_staff', 'is_superuser')

class AvisAdmin(admin.ModelAdmin):
    list_display = ('user', 'garage', 'rating', 'created_at')
    ordering = ('user',)
    list_filter = ('created_at',)
    filter_horizontal = ()

class RendezVousAdmin(admin.ModelAdmin):
    list_display = ('user', 'garage', 'service', 'appointment_date', 'status')
    ordering = ('user',)
    list_filter = ('status', 'appointment_date')
    filter_horizontal = () 

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Avis, AvisAdmin)
admin.site.register(RendezVous, RendezVousAdmin)