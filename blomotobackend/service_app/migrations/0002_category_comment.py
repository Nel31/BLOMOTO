# Generated by Django 5.0.7 on 2025-03-21 11:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('service_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='comment',
            field=models.TextField(blank=True, null=True),
        ),
    ]
