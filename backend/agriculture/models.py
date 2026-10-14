from django.db import models

class AgricultureData(models.Model):
    year = models.CharField(max_length=20)
    district = models.CharField(max_length=100)
    division = models.CharField(max_length=100, blank=True, default='')
    mandal = models.CharField(max_length=100)
    crop_type = models.CharField(max_length=100, blank=True, default='')
    crop_name = models.CharField(max_length=500)
    season = models.CharField(max_length=100, blank=True, default='')
    area_production = models.CharField(max_length=100)
    value = models.FloatField(null=True, blank=True)
    note = models.TextField(blank=True, default='')