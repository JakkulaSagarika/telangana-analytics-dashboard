from rest_framework import serializers
from .models import RainfallRecord


class RainfallRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = RainfallRecord

        fields = [
            "id",
            "district",
            "mandal",
            "date",
            "rain_mm",
            "min_temperature",
            "max_temperature",
            "min_humidity",
            "max_humidity",
            "min_wind_speed",
            "max_wind_speed",
        ]