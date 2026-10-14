from django.db import models


class HealthRecord(models.Model):

    month = models.CharField(max_length=20)

    date = models.DateField()

    district_name = models.CharField(max_length=100)

    facility_name = models.CharField(max_length=200)

    unique_id = models.CharField(max_length=100, unique=True)

    age = models.IntegerField()

    gender = models.CharField(max_length=20)

    red_blood_cells = models.FloatField()

    thrombocytes = models.FloatField()

    white_blood_cells = models.FloatField()

    def __str__(self):
        return f"{self.unique_id} - {self.district_name}"