from django.db import models


class RainfallRecord(models.Model):

    # ============================================================
    # LOCATION
    # ============================================================

    district = models.CharField(
        max_length=100
    )

    mandal = models.CharField(
        max_length=150
    )

    # ============================================================
    # DATE
    # ============================================================

    date = models.DateField()

    # ============================================================
    # RAINFALL
    # ============================================================

    rain_mm = models.FloatField(
        default=0
    )

    # ============================================================
    # TEMPERATURE
    # ============================================================

    min_temperature = models.FloatField(
        null=True,
        blank=True
    )

    max_temperature = models.FloatField(
        null=True,
        blank=True
    )

    # ============================================================
    # HUMIDITY
    # ============================================================

    min_humidity = models.FloatField(
        null=True,
        blank=True
    )

    max_humidity = models.FloatField(
        null=True,
        blank=True
    )

    # ============================================================
    # WIND SPEED
    # ============================================================

    min_wind_speed = models.FloatField(
        null=True,
        blank=True
    )

    max_wind_speed = models.FloatField(
        null=True,
        blank=True
    )

    # ============================================================
    # DATABASE OPTIONS
    # ============================================================

    class Meta:

        ordering = [
            "date",
            "district",
            "mandal",
        ]

        indexes = [

            # Date / year filtering
            models.Index(
                fields=["date"],
                name="rainfall_date_06df36_idx",
            ),

            # District filtering
            models.Index(
                fields=["district"],
                name="rainfall_district_7b4135_idx",
            ),

            # Mandal filtering
            models.Index(
                fields=["mandal"],
                name="rainfall_mandal_f77d62_idx",
            ),

            # Year + district queries
            models.Index(
                fields=["date", "district"],
                name="rainfall_date_district_idx",
            ),

            # Year + mandal queries
            models.Index(
                fields=["date", "mandal"],
                name="rainfall_date_mandal_idx",
            ),

            models.Index(
                fields=["district", "date"],
                name="rainfall_district_date_idx",
            ),

            models.Index(
                fields=["date", "min_humidity", "max_humidity"],
                name="rainfall_date_humidity_idx",
            ),

            models.Index(
                fields=["district", "date", "mandal"],
                name="rainfall_dist_date_mandal_idx",
            ),

            # District + mandal queries
            models.Index(
                fields=["district", "mandal"],
                name="rainfall_district_mandal_idx",
            ),

        ]

    # ============================================================
    # STRING REPRESENTATION
    # ============================================================

    def __str__(self):

        return (
            f"{self.district} - "
            f"{self.mandal} - "
            f"{self.date}"
        )
