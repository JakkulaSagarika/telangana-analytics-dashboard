from threading import Thread
from urllib.parse import quote

from django.apps import AppConfig


_warmup_started = False


def _warm_analytics_cache():
    from django.db import OperationalError, ProgrammingError
    from django.core.cache import cache
    from rest_framework.test import APIRequestFactory

    from rainfall.models import RainfallRecord
    from rainfall.views import (
        district_analysis,
        humidity_analysis,
        rainfall_trends,
        year_comparison,
    )

    try:
        years = sorted({
            item.year
            for item in RainfallRecord.objects.dates("date", "year")
        })
    except (OperationalError, ProgrammingError):
        # The development server can start before a fresh database is migrated.
        # A later startup (or the explicit warm_analytics_cache command) warms it.
        return

    districts = sorted({
        district.strip()
        for district in RainfallRecord.objects.values_list("district", flat=True)
        if district and district.strip()
    })

    if not years:
        return

    factory = APIRequestFactory()

    # Warm Year Comparison cache with the default 5-year comparison dataset.
    year_comparison_cache_key = f"year_comparison_{'_'.join(map(str, years[-5:]))}"

    if cache.get(year_comparison_cache_key) is None:
        year_comparison(
            factory.get(
                f"/year-comparison/?years={','.join(map(str, years[-5:]))}"
            )
        )

    for year in years:
        rainfall_cache_key = f"telangana_rainfall_trends_{year}"
        humidity_cache_key = f"telangana_humidity_analysis_{year}"

        if cache.get(rainfall_cache_key) is None:
            rainfall_trends(
                factory.get(
                    f"/api/rainfall/trends/?year={year}"
                )
            )

        if cache.get(humidity_cache_key) is None:
            humidity_analysis(
                factory.get(
                    f"/api/rainfall/humidity/analysis/?year={year}"
                )
            )

        for district in districts:
            district_analysis(
                factory.get(
                    f"/api/rainfall/district/{quote(district)}/?year={year}"
                ),
                district,
            )


class RainfallConfig(AppConfig):
    name = 'rainfall'

    def ready(self):
        # Cache warming is intentionally explicit (`manage.py warm_analytics_cache`).
        # Starting an analytics thread during migrations/imports can lock SQLite.
        return
