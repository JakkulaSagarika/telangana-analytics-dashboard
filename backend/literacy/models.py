from django.db import models


class LiteracyData(models.Model):
    district = models.CharField(max_length=100, unique=True)
    males = models.IntegerField(default=0)
    females = models.IntegerField(default=0)
    literacy_rate_males = models.FloatField(default=0.0)
    literacy_rate_females = models.FloatField(default=0.0)

    class Meta:
        ordering = ["district"]

    def __str__(self):
        return self.district