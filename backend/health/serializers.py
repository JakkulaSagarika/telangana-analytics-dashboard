from rest_framework import serializers

from .models import HealthRecord


class HealthRecordSerializer(serializers.ModelSerializer):

    class Meta:

        model = HealthRecord

        fields = "__all__"
        from rest_framework import serializers


class DistrictSummarySerializer(serializers.Serializer):
    total_patients = serializers.IntegerField()
    male = serializers.IntegerField()
    female = serializers.IntegerField()
    average_age = serializers.FloatField()
    average_rbc = serializers.FloatField()
    average_wbc = serializers.FloatField()
    average_platelets = serializers.FloatField()
    facilities = serializers.IntegerField()


class MonthlyLabSerializer(serializers.Serializer):
    month = serializers.CharField()
    value = serializers.FloatField()


class FacilitySerializer(serializers.Serializer):
    facility_name = serializers.CharField()
    patients = serializers.IntegerField()
    avg_rbc = serializers.FloatField()
    avg_wbc = serializers.FloatField()
    avg_platelets = serializers.FloatField()


class DistrictInsightSerializer(serializers.Serializer):
    highest_month = serializers.CharField()
    largest_age_group = serializers.CharField()
    summary = serializers.CharField()