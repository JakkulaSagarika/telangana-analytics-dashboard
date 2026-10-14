from urllib.parse import quote

from django.core.management.base import BaseCommand
from rest_framework.test import APIRequestFactory

from rainfall.models import RainfallRecord
from rainfall.views import (
    district_analysis,
    humidity_analysis,
    rainfall_trends,
    year_comparison,
)


class Command(BaseCommand):
    help = "Precompute and cache rainfall, humidity, and district analytics payloads for all years."

    def handle(self, *args, **options):
        factory = APIRequestFactory()

        years = list(
            RainfallRecord.objects
            .dates("date", "year")
        )

        if not years:
            self.stdout.write(
                self.style.WARNING("No rainfall data found. Nothing to warm.")
            )
            return

        distinct_years = sorted({year.year for year in years})
        districts = sorted({
            district.strip()
            for district in RainfallRecord.objects.values_list("district", flat=True)
            if district and district.strip()
        })

        self.stdout.write(
            self.style.SUCCESS(
                f"Warming analytics cache for {len(distinct_years)} year(s) and {len(districts)} district(s)..."
            )
        )

        default_years = distinct_years[-5:]
        if len(default_years) >= 2:
            comparison_request = factory.get(
                f"/year-comparison/?years={','.join(map(str, default_years))}"
            )
            year_comparison(comparison_request)
            self.stdout.write(
                self.style.HTTP_INFO(
                    f"Cached Year Comparison dataset for years {', '.join(map(str, default_years))}."
                )
            )

        for year in distinct_years:
            rainfall_request = factory.get(f"/api/rainfall/trends/?year={year}")
            rainfall_trends(rainfall_request)

            humidity_request = factory.get(
                f"/api/rainfall/humidity/analysis/?year={year}"
            )
            humidity_analysis(humidity_request)

            self.stdout.write(
                self.style.HTTP_INFO(
                    f"Cached rainfall trends and humidity analysis for year {year}."
                )
            )

            for district in districts:
                district_request = factory.get(
                    f"/api/rainfall/district/{quote(district)}/?year={year}"
                )
                district_analysis(district_request, district)

            self.stdout.write(
                self.style.HTTP_INFO(
                    f"Cached district analysis for year {year}."
                )
            )

        self.stdout.write(
            self.style.SUCCESS("Analytics cache warmup completed.")
        )
