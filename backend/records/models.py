from django.db import models


class BirthCount(models.Model):
    district = models.CharField(max_length=100, unique=True)

    total = models.IntegerField(default=0)
    male = models.IntegerField(default=0)
    female = models.IntegerField(default=0)

    def __str__(self):
        return self.district


class DeathCount(models.Model):
    district = models.CharField(max_length=100, unique=True)

    total = models.IntegerField(default=0)
    male = models.IntegerField(default=0)
    female = models.IntegerField(default=0)

    def __str__(self):
        return self.district


class GramPanchayat(models.Model):
    district = models.CharField(max_length=100)

    name = models.CharField(max_length=200)

    birth_total = models.IntegerField(default=0)
    birth_male = models.IntegerField(default=0)
    birth_female = models.IntegerField(default=0)

    death_total = models.IntegerField(default=0)
    death_male = models.IntegerField(default=0)
    death_female = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class Municipality(models.Model):
    district = models.CharField(max_length=100)

    name = models.CharField(max_length=200)

    birth_total = models.IntegerField(default=0)
    birth_male = models.IntegerField(default=0)
    birth_female = models.IntegerField(default=0)

    death_total = models.IntegerField(default=0)
    death_male = models.IntegerField(default=0)
    death_female = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class MunicipalCorporation(models.Model):
    district = models.CharField(max_length=100)

    name = models.CharField(max_length=200)

    birth_total = models.IntegerField(default=0)
    birth_male = models.IntegerField(default=0)
    birth_female = models.IntegerField(default=0)

    death_total = models.IntegerField(default=0)
    death_male = models.IntegerField(default=0)
    death_female = models.IntegerField(default=0)

    def __str__(self):
        return self.name