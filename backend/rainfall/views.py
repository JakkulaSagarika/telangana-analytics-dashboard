import re
from difflib import get_close_matches
from datetime import date

from django.core.cache import cache
from django.views.decorators.cache import cache_page
from django.db import models
from django.db.models import (
    Sum,
    Avg,
    Max,
    Min,
    Count,
    Case,
    When,
    F,
    Value,
    FloatField,
    ExpressionWrapper,
    Q,
)
from django.db.models.functions import TruncMonth, TruncDay, ExtractMonth

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import RainfallRecord


# ============================================================
# YEAR FILTER
# ============================================================

def get_selected_year(request):
    """Return the requested year, defaulting to the latest database year."""
    requested_year = request.GET.get("year")

    if requested_year:
        try:
            return int(requested_year)
        except (TypeError, ValueError):
            pass

    latest_year = cache.get("telangana_latest_year")

    if latest_year is None:
        latest_year = (
            RainfallRecord.objects
            .order_by("-date")
            .values_list("date__year", flat=True)
            .first()
        )
        cache.set("telangana_latest_year", latest_year, 3600)

    if latest_year is None:
        return None

    return latest_year


def filter_by_year(queryset, year):
    """Use the date index instead of applying a function to every date."""
    return queryset.filter(
        date__gte=date(year, 1, 1),
        date__lt=date(year + 1, 1, 1),
    )


@api_view(["GET"])
def available_years(request):
    cached_years = cache.get("telangana_available_years")

    if cached_years is not None:
        return Response(cached_years)

    years = RainfallRecord.objects.dates("date", "year")
    year_values = [item.year for item in years]

    payload = {
        "success": True,
        "years": year_values,
        "latest_year": year_values[-1] if year_values else None,
    }

    cache.set("telangana_available_years", payload, 3600)

    return Response(payload)



# ============================================================
# DISTRICT NORMALIZATION
# ============================================================

def normalize_district(name):
    return re.sub(
        r"[^a-z0-9]",
        "",
        str(name or "").strip().lower()
    )


DISTRICT_ALIASES = {
    "adilabad": ["adilabad"],
    "bhadradrikothagudem": [
        "bhadradrikothagudem",
        "bhadradri kothagudem",
        "bhadradri",
        "kothagudem",
    ],
    "hanumakonda": [
        "hanumakonda",
        "hanamkonda",
    ],
    "hyderabad": ["hyderabad"],
    "jagtial": ["jagtial", "jagitial"],
    "jayashankarbhupalapally": [
        "jayashankarbhupalapally",
        "jayashankar bhupalapally",
        "jayashankar bhupalpally",
        "bhupalapally",
        "bhupalpally",
    ],
    "jogulambagadwal": [
        "jogulamba gadwal",
        "jogulambagadwal",
        "gadwal",
    ],
    "kamareddy": ["kamareddy", "kamareddi"],
    "karimnagar": ["karimnagar"],
    "khammam": ["khammam"],
    "komarambheemasifabad": [
        "komaram bheem asifabad",
        "komaram bheem-asifabad",
        "komarambheemasifabad",
        "komaram bheem",
        "asifabad",
    ],
    "mahabubabad": ["mahabubabad", "mahbubabad"],
    "mahabubnagar": ["mahabubnagar", "mahbubnagar"],
    "mancherial": ["mancherial"],
    "medak": ["medak"],
    "medchalmalajgiri": [
        "medchal malkajgiri",
        "medchal-malajgiri",
        "medchalmalajgiri",
        "medchal",
    ],
    "mulugu": ["mulugu"],
    "nagarkurnool": [
        "nagarkurnool",
        "nagar kurnool",
    ],
    "nalgonda": ["nalgonda"],
    "narayanpet": ["narayanpet"],
    "nirmal": ["nirmal"],
    "nizamabad": ["nizamabad"],
    "peddapalli": [
        "peddapalli",
        "peddapally",
    ],
    "rajannasircilla": [
        "rajanna sircilla",
        "rajannasircilla",
        "sircilla",
    ],
    "rangareddy": [
        "ranga reddy",
        "rangareddy",
    ],
    "sangareddy": [
        "sangareddy",
        "sangareddi",
    ],
    "siddipet": ["siddipet"],
    "suryapet": ["suryapet"],
    "vikarabad": ["vikarabad"],
    "wanaparthy": [
        "wanaparthy",
        "wanaparthi",
    ],
    "warangalr": [
        "warangal (r)",
        "warangal(r)",
        "warangal rural",
        "warangalrural",
        "warangal r",
    ],
    "warangalurban": [
        "warangal urban",
        "warangalurban",
    ],
    "yadadribhuvanagiri": [
        "yadadri bhongir",
        "yadadri-bhongir",
        "yadadribhongiri",
        "yadadri bhuvanagiri",
        "yadadribhuvanagiri",
        "yadagiribhuvanagiri",
        "yadadri",
        "bhongir",
    ],
}


# ============================================================
# GET DISTRICT RECORDS
# ============================================================

def get_district_name_lookup():
    cache_key = "telangana_district_name_lookup"
    cached_lookup = cache.get(cache_key)

    if cached_lookup is not None:
        return cached_lookup

    district_names = list(
        RainfallRecord.objects
        .values_list("district", flat=True)
        .distinct()
        .order_by("district")
    )

    actual_lookup = {
        normalize_district(name): name
        for name in district_names
        if name
    }

    alias_lookup = {}

    for canonical, aliases in DISTRICT_ALIASES.items():
        normalized_canonical = normalize_district(canonical)
        normalized_aliases = [
            normalize_district(alias)
            for alias in aliases
        ]

        candidate = next(
            (
                actual_lookup[normalized_alias]
                for normalized_alias in normalized_aliases
                if normalized_alias in actual_lookup
            ),
            None,
        )

        if candidate:
            alias_lookup[normalized_canonical] = candidate

            for normalized_alias in normalized_aliases:
                alias_lookup[normalized_alias] = candidate

    lookup = {
        "actual": actual_lookup,
        "alias": alias_lookup,
    }

    cache.set(cache_key, lookup, 86400)

    return lookup


def get_district_records(district_name):

    requested = str(
        district_name or ""
    ).strip()

    normalized = normalize_district(
        requested
    )

    if not normalized:
        return (
            RainfallRecord.objects.none(),
            requested,
        )

    lookup = get_district_name_lookup()
    actual_lookup = lookup["actual"]
    alias_lookup = lookup["alias"]

    if normalized in actual_lookup:
        actual_district = actual_lookup[normalized]
        return (
            RainfallRecord.objects.filter(
                district__iexact=actual_district
            ),
            actual_district,
        )

    if normalized in alias_lookup:
        actual_district = alias_lookup[normalized]
        return (
            RainfallRecord.objects.filter(
                district__iexact=actual_district
            ),
            actual_district,
        )

    matches = get_close_matches(
        normalized,
        list(actual_lookup),
        n=1,
        cutoff=0.80
    )

    if matches:
        actual_district = actual_lookup[matches[0]]

        return (
            RainfallRecord.objects.filter(
                district__iexact=actual_district
            ),
            actual_district,
        )

    return (
        RainfallRecord.objects.none(),
        requested,
    )


# ============================================================
# DAILY RAINFALL
# ============================================================

@api_view(["GET"])
@cache_page(86400)
def daily_rainfall(request, date):

    records = RainfallRecord.objects.filter(date=date)

    if not records.exists():
        return Response({
            "success": False,
            "message": "No rainfall data found for this date.",
            "date": date,
        }, status=404)

    summary = records.aggregate(
        total_rainfall=Sum("rain_mm"),
        average_rainfall=Avg("rain_mm"),
        highest_rainfall=Max("rain_mm"),
        average_min_humidity=Avg("min_humidity"),
        average_max_humidity=Avg("max_humidity"),
        total_mandals=Count("id"),
    )

    distribution_counts = records.aggregate(
        no_rain=Count("id", filter=Q(rain_mm=0)),
        low=Count("id", filter=Q(rain_mm__gt=0) & Q(rain_mm__lt=10)),
        moderate=Count("id", filter=Q(rain_mm__gte=10) & Q(rain_mm__lt=50)),
        high=Count("id", filter=Q(rain_mm__gte=50) & Q(rain_mm__lt=100)),
        very_high=Count("id", filter=Q(rain_mm__gte=100)),
    )

    distribution = {
        "no_rain": distribution_counts["no_rain"] or 0,
        "low": distribution_counts["low"] or 0,
        "moderate": distribution_counts["moderate"] or 0,
        "high": distribution_counts["high"] or 0,
        "very_high": distribution_counts["very_high"] or 0,
    }

    top = records.order_by(
        "-rain_mm",
        "district",
        "mandal"
    )[:5]

    top_5 = [
        {
            "rank": i,
            "mandal": r.mandal,
            "district": r.district,
            "rainfall_mm": float(r.rain_mm or 0),
            "min_humidity": float(r.min_humidity or 0),
            "max_humidity": float(r.max_humidity or 0),
        }
        for i, r in enumerate(top, 1)
    ]

    mandals = [
        {
            "rank": i,
            "district": r["district"],
            "mandal": r["mandal"],
            "rainfall_mm": float(r["rain_mm"] or 0),
            "min_humidity": float(r["min_humidity"] or 0),
            "max_humidity": float(r["max_humidity"] or 0),
        }
        for i, r in enumerate(
            records.values(
                "district",
                "mandal",
                "rain_mm",
                "min_humidity",
                "max_humidity",
            ).order_by(
                "-rain_mm",
                "district",
                "mandal",
            ),
            1,
        )
    ]

    districts = [
        {
            "rank": i,
            "district": r["district"],
            "rainfall_mm": float(r["rainfall_mm"] or 0),
            "average_rainfall": float(
                r["average_rainfall"] or 0
            ),
            "mandal_count": r["mandal_count"],
        }
        for i, r in enumerate(
            records.values(
                "district"
            ).annotate(
                rainfall_mm=Sum("rain_mm"),
                average_rainfall=Avg("rain_mm"),
                mandal_count=Count("id"),
            ).order_by(
                "-rainfall_mm"
            ),
            1,
        )
    ]

    return Response({
        "success": True,
        "date": date,

        "summary": {
            "total_rainfall": float(
                summary["total_rainfall"] or 0
            ),
            "average_rainfall": float(
                summary["average_rainfall"] or 0
            ),
            "highest_rainfall": float(
                summary["highest_rainfall"] or 0
            ),
            "total_mandals": summary["total_mandals"],
            "rain_receiving_mandals": (
                (summary["total_mandals"] or 0)
                - distribution["no_rain"]
            ),
            "no_rain_mandals": distribution["no_rain"],
            "average_min_humidity": float(
                summary["average_min_humidity"] or 0
            ),
            "average_max_humidity": float(
                summary["average_max_humidity"] or 0
            ),
        },

        "wettest_district": (
            {
                "district": districts[0]["district"],
                "rainfall_mm": districts[0]["rainfall_mm"],
            }
            if districts
            else None
        ),

        "rainfall_distribution": distribution,
        "top_5_mandals": top_5,
        "districts": districts,
        "mandal_count": len(mandals),
        "mandals": mandals,
    })


# ============================================================
# YEARLY CALENDAR
# ============================================================

@api_view(["GET"])
@cache_page(86400)
def yearly_calendar(request):

    year = get_selected_year(request)

    rows = (
        filter_by_year(RainfallRecord.objects, year)
        .values("date")
        .annotate(
            total_rainfall=Sum("rain_mm"),
            average_rainfall=Avg("rain_mm"),
            average_min_humidity=Avg("min_humidity"),
            average_max_humidity=Avg("max_humidity"),
        )
        .order_by("date")
    )

    calendar = [
        {
            "date": r["date"],
            "total_rainfall": round(
                float(r["total_rainfall"] or 0),
                2
            ),
            "average_rainfall": round(
                float(r["average_rainfall"] or 0),
                2
            ),
            "average_min_humidity": round(
                float(r["average_min_humidity"] or 0),
                2
            ),
            "average_max_humidity": round(
                float(r["average_max_humidity"] or 0),
                2
            ),
        }
        for r in rows
    ]

    return Response({
        "success": True,
        "year": year,
        "count": len(calendar),
        "calendar": calendar,
    })


# ============================================================
# DISTRICT LIST
# ============================================================

@api_view(["GET"])
@cache_page(86400)
def district_list(request):

    year = get_selected_year(request)

    districts = list(
        filter_by_year(RainfallRecord.objects, year)
        .values_list(
            "district",
            flat=True
        )
        .distinct()
        .order_by("district")
    )

    return Response({
        "success": True,
        "count": len(districts),
        "districts": districts,
    })


# ============================================================
# MANDAL LIST
# ============================================================

@api_view(["GET"])
@cache_page(86400)
def mandal_list(request):

    year = get_selected_year(request)

    district = request.GET.get(
        "district"
    )

    queryset = filter_by_year(RainfallRecord.objects, year)
    actual_district = district

    if district:

        queryset, actual_district = (
            get_district_records(district)
        )
        queryset = filter_by_year(queryset, year)

        if not queryset.exists():
            return Response({
                "success": False,
                "message": "No rainfall data found for this district.",
                "mandals": [],
            }, status=404)

    mandals = list(
        queryset
        .values(
            "mandal",
            "district"
        )
        .distinct()
        .order_by(
            "district",
            "mandal"
        )
    )

    return Response({
        "success": True,
        "district": actual_district,
        "count": len(mandals),
        "mandals": mandals,
    })


# ============================================================
# DISTRICT ANALYSIS
# ============================================================

@api_view(["GET"])
@cache_page(86400)
def district_analysis(
    request,
    district_name
):

    year = get_selected_year(request)

    records, actual_district = (
        get_district_records(
            district_name
        )
    )
    records = filter_by_year(records, year)

    if not records.exists():
        return Response({
            "success": False,
            "message": "No rainfall data found for this district.",
            "requested_district": district_name,
        }, status=404)

    summary = records.aggregate(
        average_rainfall=Avg("rain_mm"),
        highest_rainfall=Max("rain_mm"),
        lowest_rainfall=Min("rain_mm"),
        total_rainfall=Sum("rain_mm"),
    )

    daily = (
        records
        .values("date")
        .annotate(
            rainfall=Sum("rain_mm")
        )
        .order_by("date")
    )

    daily_list = list(daily)

    rainy_days = sum(
        1
        for item in daily_list
        if float(item["rainfall"] or 0) > 0
    )

    highest_rainfall_day = max(
        daily_list,
        key=lambda item: float(
            item["rainfall"] or 0
        ),
        default=None,
    )

    month_names = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    monthly_values = {}

    for item in daily_list:

        month = item["date"].month

        monthly_values.setdefault(
            month,
            []
        ).append(
            float(item["rainfall"] or 0)
        )

    monthly_rainfall = []

    for month, name in enumerate(
        month_names,
        1
    ):

        values = monthly_values.get(
            month,
            []
        )

        monthly_rainfall.append({
            "month": month,
            "month_name": name,
            "rainfall_mm": round(
                sum(values) / len(values)
                if values
                else 0,
                2
            ),
        })

    daily_rainfall = [
        {
            "date": r["date"],
            "rainfall_mm": round(
                float(r["rainfall"] or 0),
                2
            ),
        }
        for r in daily_list
    ]

    return Response({
        "success": True,
        "district": actual_district,
        "requested_district": district_name,
        "year": year,

        "summary": {
            "average_rainfall": round(
                float(
                    summary["average_rainfall"] or 0
                ),
                2
            ),
            "highest_rainfall": round(
                float(
                    summary["highest_rainfall"] or 0
                ),
                2
            ),
            "lowest_rainfall": round(
                float(
                    summary["lowest_rainfall"] or 0
                ),
                2
            ),
            "total_rainfall": round(
                float(
                    summary["total_rainfall"] or 0
                ),
                2
            ),
            "rainy_days": rainy_days,
            "highest_rainfall_date": (
                highest_rainfall_day["date"]
                if highest_rainfall_day
                else None
            ),
        },

        "monthly_rainfall": monthly_rainfall,
        "daily_rainfall": daily_rainfall,
    })


# ============================================================
# MANDAL ANALYSIS
# ============================================================

@api_view(["GET"])
@cache_page(86400)
def mandal_analysis(
    request,
    district_name,
    mandal_name
):

    year = get_selected_year(request)

    district_records, actual_district = (
        get_district_records(
            district_name
        )
    )
    district_records = filter_by_year(district_records, year)

    if not district_records.exists():
        return Response({
            "success": False,
            "message": "No rainfall data found for this district.",
            "district": district_name,
        }, status=404)

    requested = re.sub(
        r"[^a-z0-9]",
        "",
        str(mandal_name).strip().lower()
    )

    mandal_names = list(
        district_records
        .values_list(
            "mandal",
            flat=True
        )
        .distinct()
    )

    actual_mandal = next(
        (
            name
            for name in mandal_names
            if re.sub(
                r"[^a-z0-9]",
                "",
                str(name).strip().lower()
            ) == requested
        ),
        None
    )

    if not actual_mandal:
        return Response({
            "success": False,
            "message": "No rainfall data found for this mandal.",
            "district": actual_district,
            "mandal": mandal_name,
        }, status=404)

    records = district_records.filter(
        mandal=actual_mandal
    )

    summary = records.aggregate(
        total_rainfall=Sum("rain_mm"),
        average_rainfall=Avg("rain_mm"),
        highest_rainfall=Max("rain_mm"),
        lowest_rainfall=Min("rain_mm"),
    )

    daily = list(
        records
        .values("date")
        .annotate(
            rainfall=Sum("rain_mm")
        )
        .order_by("date")
    )

    rainy_days = sum(
        1
        for r in daily
        if float(r["rainfall"] or 0) > 0
    )

    highest = (
        records
        .order_by(
            "-rain_mm",
            "date"
        )
        .first()
    )

    monthly = (
        records
        .annotate(
            month=TruncMonth("date")
        )
        .values("month")
        .annotate(
            rainfall=Sum("rain_mm")
        )
        .order_by("month")
    )

    monthly_rainfall = [
        {
            "month": r["month"].strftime("%b"),
            "month_name": r["month"].strftime("%B"),
            "rainfall_mm": round(
                float(r["rainfall"] or 0),
                1
            ),
        }
        for r in monthly
        if r["month"]
    ]

    daily_rainfall = [
        {
            "date": r["date"],
            "rainfall_mm": round(
                float(r["rainfall"] or 0),
                1
            ),
        }
        for r in daily
    ]

    seasons = {
        "Winter": {
            "months": [1, 2],
            "month_names": [
                "January",
                "February"
            ],
        },

        "Summer": {
            "months": [3, 4, 5],
            "month_names": [
                "March",
                "April",
                "May"
            ],
        },

        "Southwest Monsoon": {
            "months": [6, 7, 8, 9],
            "month_names": [
                "June",
                "July",
                "August",
                "September"
            ],
        },

        "Post-Monsoon": {
            "months": [10, 11, 12],
            "month_names": [
                "October",
                "November",
                "December"
            ],
        },
    }

    seasonal_rainfall = []

    total_rainfall = float(
        summary["total_rainfall"] or 0
    )

    for season, info in seasons.items():

        season_records = records.filter(
            date__month__in=info["months"]
        )

        season_daily = (
            season_records
            .values("date")
            .annotate(
                rainfall=Sum("rain_mm")
            )
        )

        season_total = float(
            season_records
            .aggregate(
                total=Sum("rain_mm")
            )["total"] or 0
        )

        season_rainy = sum(
            1
            for r in season_daily
            if float(r["rainfall"] or 0) > 0
        )

        season_days = season_daily.count()

        season_dry = (
            season_days -
            season_rainy
        )

        humidity = season_records.aggregate(
            min_humidity=Avg("min_humidity"),
            max_humidity=Avg("max_humidity"),
        )

        seasonal_rainfall.append({
            "season": season,
            "months": info["month_names"],
            "rainfall_mm": round(
                season_total,
                1
            ),
            "percentage": round(
                season_total /
                total_rainfall *
                100
                if total_rainfall
                else 0,
                1
            ),
            "average_rainfall": round(
                season_total /
                season_days
                if season_days
                else 0,
                1
            ),
            "rainy_days": season_rainy,
            "dry_days": season_dry,
            "rainy_day_ratio": round(
                season_rainy /
                season_days *
                100
                if season_days
                else 0,
                1
            ),
            "dry_day_ratio": round(
                season_dry /
                season_days *
                100
                if season_days
                else 0,
                1
            ),
            "average_min_humidity": round(
                float(
                    humidity["min_humidity"] or 0
                ),
                1
            ),
            "average_max_humidity": round(
                float(
                    humidity["max_humidity"] or 0
                ),
                1
            ),
        })

    return Response({
        "success": True,
        "district": actual_district,
        "mandal": actual_mandal,
        "requested_district": district_name,
        "requested_mandal": mandal_name,
        "year": year,

        "total_rainfall": round(
            total_rainfall,
            1
        ),

        "average_rainfall": round(
            float(
                summary["average_rainfall"] or 0
            ),
            1
        ),

        "highest_rainfall": round(
            float(
                summary["highest_rainfall"] or 0
            ),
            1
        ),

        "lowest_rainfall": round(
            float(
                summary["lowest_rainfall"] or 0
            ),
            1
        ),

        "highest_rainfall_date": (
            highest.date
            if highest
            else None
        ),

        "rainy_days": rainy_days,
        "monthly_rainfall": monthly_rainfall,
        "seasonal_rainfall": seasonal_rainfall,
        "daily_rainfall": daily_rainfall,
        "record_count": len(daily_rainfall),
    })


# ============================================================
# RAINFALL TRENDS
# ============================================================

@api_view(["GET"])
def rainfall_trends(request):

    try:

        year = get_selected_year(request)
        cache_key = f"telangana_rainfall_trends_{year}"
        cached_data = cache.get(cache_key)

        if cached_data is not None:
            return Response(cached_data)

        records = filter_by_year(RainfallRecord.objects, year)

        if not records.exists():
            return Response({
                "success": False,
                "message": "No rainfall data available.",
            }, status=404)

        daily_rows = list(
            records
            .values("date")
            .annotate(
                rainfall=Sum("rain_mm")
            )
            .order_by("date")
        )

        daily_values = [
            float(row["rainfall"] or 0)
            for row in daily_rows
        ]

        total_days = len(daily_rows)

        rainy_days = sum(
            value > 0
            for value in daily_values
        )

        rain_free_days = (
            total_days -
            rainy_days
        )

        total_rainfall = sum(
            daily_values
        )

        average_daily_rainfall = (
            total_rainfall /
            total_days
            if total_days
            else 0
        )

        highest_daily_rainfall = (
            max(daily_values)
            if daily_values
            else 0
        )

        top_days = sorted(
            daily_rows,
            key=lambda row:
                float(
                    row["rainfall"] or 0
                ),
            reverse=True
        )[:20]

        top_20_days = [
            {
                "rank": index,
                "date": row["date"].strftime(
                    "%Y-%m-%d"
                ),
                "rainfall_mm": round(
                    float(
                        row["rainfall"] or 0
                    ),
                    1
                ),
            }
            for index, row in enumerate(
                top_days,
                1
            )
        ]

        district_rows = list(
            records
            .values("district")
            .annotate(
                rainfall_mm=Sum("rain_mm"),
                average_rainfall=Avg("rain_mm"),
                rainy_records=Count("id"),
            )
            .order_by(
                "-rainfall_mm",
                "district"
            )[:5]
        )

        top_5_districts = [
            {
                "rank": index,
                "district": row["district"],
                "rainfall_mm": round(
                    float(
                        row["rainfall_mm"] or 0
                    ),
                    1
                ),
                "average_rainfall": round(
                    float(
                        row["average_rainfall"] or 0
                    ),
                    1
                ),
                "rainy_records": row[
                    "rainy_records"
                ],
            }
            for index, row in enumerate(
                district_rows,
                1
            )
        ]

        mandal_rows = list(
            records
            .values(
                "district",
                "mandal"
            )
            .annotate(
                rainfall_mm=Sum("rain_mm"),
                average_rainfall=Avg("rain_mm"),
                rainy_records=Count("id"),
            )
            .order_by(
                "-rainfall_mm",
                "district",
                "mandal"
            )[:20]
        )

        top_20_mandals = [
            {
                "rank": index,
                "district": row["district"],
                "mandal": row["mandal"],
                "rainfall_mm": round(
                    float(
                        row["rainfall_mm"] or 0
                    ),
                    1
                ),
                "average_rainfall": round(
                    float(
                        row["average_rainfall"] or 0
                    ),
                    1
                ),
                "rainy_records": row[
                    "rainy_records"
                ],
            }
            for index, row in enumerate(
                mandal_rows,
                1
            )
        ]

        intensity_distribution = {
            "no_rain": 0,
            "light": 0,
            "moderate": 0,
            "heavy": 0,
            "very_heavy": 0,
            "extreme": 0,
        }

        for value in daily_values:

            if value == 0:
                intensity_distribution[
                    "no_rain"
                ] += 1

            elif value < 10:
                intensity_distribution[
                    "light"
                ] += 1

            elif value < 50:
                intensity_distribution[
                    "moderate"
                ] += 1

            elif value < 100:
                intensity_distribution[
                    "heavy"
                ] += 1

            elif value < 200:
                intensity_distribution[
                    "very_heavy"
                ] += 1

            else:
                intensity_distribution[
                    "extreme"
                ] += 1

        monthly_rows = list(
            records
            .annotate(
                month=TruncMonth("date")
            )
            .values("month")
            .annotate(
                rainfall=Sum("rain_mm")
            )
            .order_by("month")
        )

        monthly_totals = {
            row["month"].month:
                float(
                    row["rainfall"] or 0
                )
            for row in monthly_rows
            if row["month"]
        }

        month_names = [
            "Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec",
        ]

        month_full_names = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ]

        anomaly = []

        for month in range(1, 13):

            month_total = monthly_totals.get(
                month,
                0
            )

            days_in_month = sum(
                1
                for row in daily_rows
                if row["date"].month == month
            )

            monthly_average = (
                month_total /
                days_in_month
                if days_in_month
                else 0
            )

            deviation = (
                (
                    monthly_average -
                    average_daily_rainfall
                )
                /
                average_daily_rainfall
                *
                100
                if average_daily_rainfall
                else 0
            )

            anomaly.append({
                "month": month_names[month - 1],
                "month_name": month_full_names[
                    month - 1
                ],
                "rainfall_mm": round(
                    month_total,
                    1
                ),
                "average_daily_rainfall": round(
                    monthly_average,
                    2
                ),
                "deviation": round(
                    deviation,
                    1
                ),
            })

        quarters = {
            "Q1": [1, 2, 3],
            "Q2": [4, 5, 6],
            "Q3": [7, 8, 9],
            "Q4": [10, 11, 12],
        }

        quarterly_contribution = []

        for quarter, quarter_months in quarters.items():

            value = sum(
                monthly_totals.get(
                    month,
                    0
                )
                for month in quarter_months
            )

            percentage = (
                value /
                total_rainfall *
                100
                if total_rainfall
                else 0
            )

            quarterly_contribution.append({
                "quarter": quarter,
                "rainfall_mm": round(
                    value,
                    1
                ),
                "percentage": round(
                    percentage,
                    1
                ),
            })

        rainy_percentage = (
            rainy_days /
            total_days *
            100
            if total_days
            else 0
        )

        payload = {

            "success": True,

            "year": year,

            "summary": {
                "total_days": total_days,
                "rainy_days": rainy_days,
                "rain_free_days": rain_free_days,

                "rainy_day_percentage": round(
                    rainy_percentage,
                    1
                ),

                "rain_free_day_percentage": round(
                    100 - rainy_percentage,
                    1
                ),

                "total_rainfall": round(
                    total_rainfall,
                    1
                ),

                "average_daily_rainfall": round(
                    average_daily_rainfall,
                    2
                ),

                "highest_daily_rainfall": round(
                    highest_daily_rainfall,
                    1
                ),
            },

            "daily_rainfall": [
                {
                    "date": row["date"].strftime(
                        "%Y-%m-%d"
                    ),
                    "rainfall_mm": round(
                        float(
                            row["rainfall"] or 0
                        ),
                        1
                    ),
                }
                for row in daily_rows
            ],

            "intensity_distribution":
                intensity_distribution,

            "anomaly": anomaly,

            "top_20_days":
                top_20_days,

            "top_5_districts":
                top_5_districts,

            "top_20_mandals":
                top_20_mandals,

            "quarterly_contribution":
                quarterly_contribution,
        }

        cache.set(cache_key, payload, 86400)

        return Response(payload)

    except Exception as e:

        print(
            "Rainfall trends error:",
            e
        )

        return Response({
            "success": False,
            "message": "Unable to load rainfall trends data.",
            "error": str(e),
        }, status=500)


# ============================================================
# YEAR COMPARISON
# ============================================================

@api_view(["GET"])
def year_comparison(request):

    years_param = request.GET.get("years", "")

    parsed_years = []

    for part in str(years_param).split(","):
        part = part.strip()

        if part:
            try:
                year = int(part)
            except ValueError:
                continue

            if year >= 1900:
                parsed_years.append(year)

    if not parsed_years:
        available_years = sorted({
            item.year
            for item in RainfallRecord.objects.dates("date", "year")
        })
        parsed_years = available_years[-5:]

    parsed_years = sorted(set(parsed_years))

    if len(parsed_years) < 2:
        return Response({
            "success": False,
            "message": "Please select at least 2 years to compare.",
        }, status=400)

    if len(parsed_years) > 5:
        return Response({
            "success": False,
            "message": "Please select between 2 and 5 years only.",
        }, status=400)

    cache_key = f"year_comparison_{'_'.join(map(str, parsed_years))}"
    cached_data = cache.get(cache_key)

    if cached_data is not None:
        return Response(cached_data)

    year_names = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    month_rows = list(
        RainfallRecord.objects
        .filter(date__year__in=parsed_years)
        .annotate(month=TruncMonth("date"))
        .values("date__year", "month")
        .annotate(rainfall=Sum("rain_mm"))
        .order_by("date__year", "month")
    )

    monthly_totals = {
        year: {
            month_index: 0
            for month_index in range(1, 13)
        }
        for year in parsed_years
    }

    for row in month_rows:
        year = row["date__year"]
        month_index = row["month"].month
        monthly_totals[year][month_index] = float(
            row["rainfall"] or 0
        )

    daily_rows = list(
        RainfallRecord.objects
        .filter(date__year__in=parsed_years)
        .values("date__year", "date")
        .annotate(rainfall=Sum("rain_mm"))
        .order_by("date__year", "date")
    )

    daily_by_year = {
        year: []
        for year in parsed_years
    }

    for row in daily_rows:
        year = row["date__year"]

        daily_by_year.setdefault(year, []).append({
            "date": row["date"],
            "rainfall_mm": float(row["rainfall"] or 0),
        })

    summary_rows = []
    wettest_months = []
    highest_rainfall_days = []
    intensity_distribution = []
    dry_spells = []
    wet_spells = []

    def get_spell_stats(year_daily_rows):
        if not year_daily_rows:
            return {
                "dry": {"days": 0, "start_date": None, "end_date": None},
                "wet": {"days": 0, "start_date": None, "end_date": None},
            }

        year_daily_rows.sort(
            key=lambda item: item["date"]
        )

        longest_dry = {
            "days": 0,
            "start_date": None,
            "end_date": None,
        }
        longest_wet = {
            "days": 0,
            "start_date": None,
            "end_date": None,
        }

        current_dry = {
            "days": 0,
            "start_date": None,
            "end_date": None,
        }
        current_wet = {
            "days": 0,
            "start_date": None,
            "end_date": None,
        }

        for index, item in enumerate(year_daily_rows):
            rainfall = float(item["rainfall_mm"] or 0)
            current_date = item["date"]

            if rainfall > 0:
                if current_wet["start_date"] is None:
                    current_wet = {
                        "days": 1,
                        "start_date": current_date,
                        "end_date": current_date,
                    }
                else:
                    next_date = current_date
                    current_wet["days"] += 1
                    current_wet["end_date"] = next_date

                if current_dry["start_date"] is not None:
                    dry_days = current_dry["days"]

                    if dry_days > longest_dry["days"]:
                        longest_dry = {
                            "days": dry_days,
                            "start_date": current_dry["start_date"],
                            "end_date": current_dry["end_date"],
                        }

                    current_dry = {
                        "days": 0,
                        "start_date": None,
                        "end_date": None,
                    }

                if current_wet["days"] > longest_wet["days"]:
                    longest_wet = {
                        "days": current_wet["days"],
                        "start_date": current_wet["start_date"],
                        "end_date": current_wet["end_date"],
                    }

            else:
                if current_dry["start_date"] is None:
                    current_dry = {
                        "days": 1,
                        "start_date": current_date,
                        "end_date": current_date,
                    }
                else:
                    current_dry["days"] += 1
                    current_dry["end_date"] = current_date

                if current_wet["start_date"] is not None:
                    wet_days = current_wet["days"]

                    if wet_days > longest_wet["days"]:
                        longest_wet = {
                            "days": wet_days,
                            "start_date": current_wet["start_date"],
                            "end_date": current_wet["end_date"],
                        }

                    current_wet = {
                        "days": 0,
                        "start_date": None,
                        "end_date": None,
                    }

                if current_dry["days"] > longest_dry["days"]:
                    longest_dry = {
                        "days": current_dry["days"],
                        "start_date": current_dry["start_date"],
                        "end_date": current_dry["end_date"],
                    }

        if current_wet["start_date"] is not None:
            wet_days = current_wet["days"]

            if wet_days > longest_wet["days"]:
                longest_wet = {
                    "days": wet_days,
                    "start_date": current_wet["start_date"],
                    "end_date": current_wet["end_date"],
                }

        if current_dry["start_date"] is not None:
            dry_days = current_dry["days"]

            if dry_days > longest_dry["days"]:
                longest_dry = {
                    "days": dry_days,
                    "start_date": current_dry["start_date"],
                    "end_date": current_dry["end_date"],
                }

        return {
            "dry": longest_dry,
            "wet": longest_wet,
        }

    for year in parsed_years:
        year_daily = daily_by_year.get(year, [])
        total_rainfall = sum(
            item["rainfall_mm"]
            for item in year_daily
        )
        rainy_days = sum(
            1
            for item in year_daily
            if float(item["rainfall_mm"] or 0) > 0
        )
        dry_days = len(year_daily) - rainy_days

        wettest_month_index = max(
            range(1, 13),
            key=lambda month_index: monthly_totals.get(year, {}).get(month_index, 0),
            default=1,
        )

        highest_daily = max(
            year_daily,
            key=lambda item: float(item["rainfall_mm"] or 0),
            default={
                "date": None,
                "rainfall_mm": 0,
            },
        )

        summary_rows.append({
            "year": year,
            "total_rainfall": round(total_rainfall, 1),
            "rainy_days": rainy_days,
            "dry_days": dry_days,
            "wettest_month": {
                "month": wettest_month_index,
                "month_name": year_names[wettest_month_index - 1],
                "rainfall_mm": round(
                    monthly_totals.get(year, {}).get(wettest_month_index, 0),
                    1,
                ),
            },
            "highest_rainfall_day": {
                "date": highest_daily["date"].strftime("%Y-%m-%d") if highest_daily.get("date") else None,
                "rainfall_mm": round(float(highest_daily["rainfall_mm"] or 0), 1),
            },
            "total_days": len(year_daily),
        })

        wettest_months.append({
            "year": year,
            "month": wettest_month_index,
            "month_name": year_names[wettest_month_index - 1],
            "rainfall_mm": round(
                monthly_totals.get(year, {}).get(wettest_month_index, 0),
                1,
            ),
        })

        highest_rainfall_days.append({
            "year": year,
            "date": highest_daily["date"].strftime("%Y-%m-%d") if highest_daily.get("date") else None,
            "rainfall_mm": round(float(highest_daily["rainfall_mm"] or 0), 1),
        })

        counts = {
            "no_rain": 0,
            "light": 0,
            "moderate": 0,
            "heavy": 0,
            "very_heavy": 0,
            "extreme": 0,
        }

        for item in year_daily:
            rainfall = float(item["rainfall_mm"] or 0)

            if rainfall == 0:
                counts["no_rain"] += 1
            elif rainfall < 10:
                counts["light"] += 1
            elif rainfall < 50:
                counts["moderate"] += 1
            elif rainfall < 100:
                counts["heavy"] += 1
            elif rainfall < 200:
                counts["very_heavy"] += 1
            else:
                counts["extreme"] += 1

        intensity_distribution.append({
            "year": year,
            **counts,
        })

        spells = get_spell_stats(year_daily)
        dry_spells.append({
            "year": year,
            "days": spells["dry"]["days"],
            "start_date": spells["dry"]["start_date"].strftime("%Y-%m-%d") if spells["dry"]["start_date"] else None,
            "end_date": spells["dry"]["end_date"].strftime("%Y-%m-%d") if spells["dry"]["end_date"] else None,
        })
        wet_spells.append({
            "year": year,
            "days": spells["wet"]["days"],
            "start_date": spells["wet"]["start_date"].strftime("%Y-%m-%d") if spells["wet"]["start_date"] else None,
            "end_date": spells["wet"]["end_date"].strftime("%Y-%m-%d") if spells["wet"]["end_date"] else None,
        })

    monthly_trend = []

    for month_index in range(1, 13):
        entry = {
            "month": month_index,
            "month_name": year_names[month_index - 1],
        }

        for year in parsed_years:
            entry[str(year)] = round(
                monthly_totals.get(year, {}).get(month_index, 0),
                1,
            )

        monthly_trend.append(entry)

    combined_wettest_month = []

    for month_index in range(1, 13):
        total = sum(
            monthly_totals.get(year, {}).get(month_index, 0)
            for year in parsed_years
        )

        combined_wettest_month.append({
            "month": month_index,
            "month_name": year_names[month_index - 1],
            "rainfall_mm": round(total, 1),
        })

    yoy_changes = []

    for index, year in enumerate(parsed_years):
        if index == 0:
            yoy_changes.append({
                "year": year,
                "change_pct": None,
                "previous_year": None,
            })
            continue

        previous_year = parsed_years[index - 1]
        previous_summary = next(
            item for item in summary_rows if item["year"] == previous_year
        )
        current_summary = next(
            item for item in summary_rows if item["year"] == year
        )

        previous_total = float(previous_summary["total_rainfall"] or 0)
        current_total = float(current_summary["total_rainfall"] or 0)

        if previous_total:
            change_pct = ((current_total - previous_total) / previous_total) * 100
        else:
            change_pct = 0

        yoy_changes.append({
            "year": year,
            "change_pct": round(change_pct, 1),
            "previous_year": previous_year,
        })

    consistency_metrics = []

    for year in parsed_years:
        monthly_values = [
            monthly_totals.get(year, {}).get(month_index, 0)
            for month_index in range(1, 13)
        ]

        mean_value = sum(monthly_values) / len(monthly_values) if monthly_values else 0

        variance = sum(
            (value - mean_value) ** 2
            for value in monthly_values
        ) / len(monthly_values) if monthly_values else 0

        std_dev = variance ** 0.5

        cv = (std_dev / mean_value * 100) if mean_value else 0

        consistency_metrics.append({
            "year": year,
            "cv": round(cv, 1),
            "mean_monthly_rainfall": round(mean_value, 1),
            "std_dev": round(std_dev, 1),
        })

    consistency_metrics.sort(key=lambda item: item["cv"])

    wettest_year = max(
        summary_rows,
        key=lambda item: float(item["total_rainfall"] or 0),
        default=None,
    )
    driest_year = min(
        summary_rows,
        key=lambda item: float(item["total_rainfall"] or 0),
        default=None,
    )

    combined_wettest_month_record = max(
        combined_wettest_month,
        key=lambda item: float(item["rainfall_mm"] or 0),
        default=None,
    )

    highest_day_record = max(
        highest_rainfall_days,
        key=lambda item: float(item["rainfall_mm"] or 0),
        default=None,
    )

    most_consistent = consistency_metrics[0] if consistency_metrics else None
    most_variable = consistency_metrics[-1] if consistency_metrics else None

    longest_dry = max(
        dry_spells,
        key=lambda item: int(item["days"] or 0),
        default=None,
    )

    longest_wet = max(
        wet_spells,
        key=lambda item: int(item["days"] or 0),
        default=None,
    )

    year_story = []

    if wettest_year:
        year_story.append(
            f"{wettest_year['year']} was the wettest selected year, receiving {wettest_year['total_rainfall']} mm of rainfall."
        )

    if combined_wettest_month_record:
        year_story.append(
            f"{combined_wettest_month_record['month_name']} recorded the highest combined rainfall across the selected years with {combined_wettest_month_record['rainfall_mm']} mm."
        )

    if highest_day_record:
        year_story.append(
            f"{highest_day_record['year']} recorded the highest single-day rainfall on {highest_day_record['date']} with {highest_day_record['rainfall_mm']} mm."
        )

    if longest_dry:
        year_story.append(
            f"{longest_dry['year']} had the longest dry spell at {longest_dry['days']} days from {longest_dry['start_date']} to {longest_dry['end_date']}."
        )

    if longest_wet:
        year_story.append(
            f"{longest_wet['year']} had the longest wet spell at {longest_wet['days']} days from {longest_wet['start_date']} to {longest_wet['end_date']}."
        )

    if most_consistent:
        year_story.append(
            f"{most_consistent['year']} was the most consistent year, with a coefficient of variation of {most_consistent['cv']}%."
        )

    if driest_year:
        year_story.append(
            f"{driest_year['year']} was the driest selected year, receiving {driest_year['total_rainfall']} mm."
        )

    payload = {
        "success": True,
        "years": parsed_years,
        "summary": summary_rows,
        "annual_rainfall": [
            {
                "year": item["year"],
                "total_rainfall": item["total_rainfall"],
            }
            for item in summary_rows
        ],
        "rainy_dry_days": [
            {
                "year": item["year"],
                "rainy_days": item["rainy_days"],
                "dry_days": item["dry_days"],
            }
            for item in summary_rows
        ],
        "monthly_trend": monthly_trend,
        "wettest_months": wettest_months,
        "combined_wettest_month": combined_wettest_month,
        "highest_rainfall_days": highest_rainfall_days,
        "intensity_distribution": intensity_distribution,
        "dry_spells": dry_spells,
        "wet_spells": wet_spells,
        "yoy_change": yoy_changes,
        "consistency": {
            "most_consistent_year": most_consistent["year"] if most_consistent else None,
            "most_variable_year": most_variable["year"] if most_variable else None,
            "metrics": consistency_metrics,
        },
        "year_story": year_story[:5],
    }

    cache.set(cache_key, payload, 86400)

    return Response(payload)


# ============================================================
# HUMIDITY ANALYSIS - OPTIMIZED
# ============================================================

@api_view(["GET"])
def humidity_analysis(request):

    year = get_selected_year(request)
    CACHE_KEY = f"telangana_humidity_analysis_{year}"

    try:

        # ----------------------------------------------------
        # CHECK CACHE FIRST
        # ----------------------------------------------------

        cached_data = cache.get(
            CACHE_KEY
        )

        if cached_data is not None:
            return Response(
                cached_data
            )

        # ----------------------------------------------------
        # ONLY RECORDS WITH HUMIDITY
        # ----------------------------------------------------

        records = (
            RainfallRecord.objects
            .filter(
                date__gte=date(year, 1, 1),
                date__lt=date(year + 1, 1, 1),
                min_humidity__isnull=False,
                max_humidity__isnull=False,
            )
        )

        if not records.exists():

            return Response({
                "success": False,
                "message": "No humidity data available.",
            }, status=404)

        # ----------------------------------------------------
        # HUMIDITY EXPRESSION
        #
        # Average humidity =
        # (minimum humidity + maximum humidity) / 2
        # ----------------------------------------------------

        humidity_expression = ExpressionWrapper(
            (
                F("min_humidity") +
                F("max_humidity")
            ) / Value(2.0),
            output_field=FloatField(),
        )

        # ====================================================
        # SUMMARY
        # ====================================================

        summary = (
            records
            .annotate(
                humidity=humidity_expression
            )
            .aggregate(
                average=Avg("humidity"),
                maximum=Max("max_humidity"),
                minimum=Min("min_humidity"),
            )
        )

        average_humidity = round(
            float(
                summary["average"] or 0
            ),
            1
        )

        maximum_humidity = round(
            float(
                summary["maximum"] or 0
            ),
            1
        )

        minimum_humidity = round(
            float(
                summary["minimum"] or 0
            ),
            1
        )

        # ====================================================
        # MONTHLY HUMIDITY
        # ====================================================

        month_names = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ]

        monthly_rows = (
            records
            .annotate(
                month=ExtractMonth("date"),
                humidity=humidity_expression,
            )
            .values("month")
            .annotate(
                average=Avg("humidity"),
                minimum=Min("min_humidity"),
                maximum=Max("max_humidity"),
            )
            .order_by("month")
        )

        monthly = []

        for row in monthly_rows:

            month_number = row["month"]

            if not month_number:
                continue

            monthly.append({

                "month":
                    month_names[
                        month_number - 1
                    ],

                "month_number":
                    month_number,

                "humidity":
                    round(
                        float(
                            row["average"] or 0
                        ),
                        1
                    ),

                "minimum":
                    round(
                        float(
                            row["minimum"] or 0
                        ),
                        1
                    ),

                "maximum":
                    round(
                        float(
                            row["maximum"] or 0
                        ),
                        1
                    ),
            })

        # ====================================================
        # PEAK MONTH
        # ====================================================

        peak_month = max(
            monthly,
            key=lambda x:
                x["humidity"],
            default=None,
        )

        peak_month_name = (
            peak_month["month"]
            if peak_month
            else "-"
        )

        # ====================================================
        # HUMIDITY DISTRIBUTION
        #
        # IMPORTANT:
        # Classification happens in database.
        # We don't create a 200k Python list.
        # ====================================================

        distribution_counts = records.annotate(
            humidity=humidity_expression
        ).aggregate(
            very_low=Count(
                Case(When(humidity__lt=20, then=1))
            ),
            low=Count(
                Case(
                    When(humidity__gte=20, humidity__lt=40, then=1)
                )
            ),
            moderate=Count(
                Case(
                    When(humidity__gte=40, humidity__lt=60, then=1)
                )
            ),
            high=Count(
                Case(
                    When(humidity__gte=60, humidity__lt=80, then=1)
                )
            ),
            very_high=Count(
                Case(When(humidity__gte=80, then=1))
            ),
        )

        distribution = [
            {"label": "Very Low", "value": distribution_counts["very_low"]},
            {"label": "Low", "value": distribution_counts["low"]},
            {"label": "Moderate", "value": distribution_counts["moderate"]},
            {"label": "High", "value": distribution_counts["high"]},
            {"label": "Very High", "value": distribution_counts["very_high"]},
        ]

        # ====================================================
        # HUMIDITY RANGE
        # ====================================================

        humidity_range = [

            {
                "month":
                    item["month"],

                "minimum":
                    item["minimum"],

                "average":
                    item["humidity"],

                "maximum":
                    item["maximum"],

                "range":
                    round(
                        item["maximum"] -
                        item["minimum"],
                        1
                    ),
            }

            for item in monthly
        ]

        # ====================================================
        # DISTRICT HUMIDITY
        # ====================================================

        district_rows = (
            records
            .annotate(
                humidity=humidity_expression
            )
            .values("district")
            .annotate(
                average=Avg("humidity")
            )
            .order_by("-average")[:10]
        )

        districts = [

            {
                "rank": index,

                "district":
                    row["district"],

                "humidity":
                    round(
                        float(
                            row["average"] or 0
                        ),
                        1
                    ),
            }

            for index, row in enumerate(
                district_rows,
                1
            )
        ]

        # ====================================================
        # DISTRICT × MONTH HEATMAP
        # ====================================================

        heatmap_rows = (
            records
            .annotate(
                month=ExtractMonth("date"),
                humidity=humidity_expression,
            )
            .values(
                "district",
                "month",
            )
            .annotate(
                humidity_avg=Avg("humidity")
            )
            .order_by(
                "district",
                "month",
            )
        )

        heatmap_dict = {}

        for row in heatmap_rows:

            district = row["district"]
            month_number = row["month"]

            if not district or not month_number:
                continue

            if district not in heatmap_dict:

                heatmap_dict[district] = {
                    "district": district
                }

                for month in month_names:
                    heatmap_dict[district][month] = 0

            heatmap_dict[
                district
            ][
                month_names[
                    month_number - 1
                ]
            ] = round(
                float(
                    row["humidity_avg"] or 0
                ),
                1
            )

        heatmap = list(
            heatmap_dict.values()
        )[:33]

        # ====================================================
        # HUMIDITY VS RAINFALL
        #
        # VERY IMPORTANT:
        #
        # We aggregate by DATE.
        #
        # Instead of:
        # 200,286 points
        #
        # We return roughly:
        # 365 points
        # ====================================================

        relationship_rows = (
            records
            .annotate(
                day=TruncDay("date")
            )
            .values("day")
            .annotate(
                rainfall=Sum("rain_mm"),
                average_min=Avg("min_humidity"),
                average_max=Avg("max_humidity"),
            )
            .order_by("day")
        )

        relationship = []

        for row in relationship_rows:

            if not row["day"]:
                continue

            min_humidity = float(
                row["average_min"] or 0
            )

            max_humidity = float(
                row["average_max"] or 0
            )

            humidity = (
                min_humidity +
                max_humidity
            ) / 2

            relationship.append({

                "date":
                    row["day"].strftime(
                        "%Y-%m-%d"
                    ),

                "humidity":
                    round(
                        humidity,
                        1
                    ),

                "rainfall":
                    round(
                        float(
                            row["rainfall"] or 0
                        ),
                        1
                    ),
            })

        # ====================================================
        # FINAL RESPONSE
        # ====================================================

        response_data = {

            "success":
                True,

            "year":
                year,

            "summary": {

                "average":
                    average_humidity,

                "average_humidity":
                    average_humidity,

                "maximum":
                    maximum_humidity,

                "maximum_humidity":
                    maximum_humidity,

                "minimum":
                    minimum_humidity,

                "minimum_humidity":
                    minimum_humidity,

                "peak_month":
                    peak_month_name,

                "peak_humidity_month":
                    peak_month_name,
            },

            "monthly":
                monthly,

            "distribution":
                distribution,

            "humidity_range":
                humidity_range,

            "humidity_rainfall":
                relationship,

            "districts":
                districts,

            "heatmap":
                heatmap,
        }

        # ====================================================
        # CACHE FOR 1 DAY
        # ====================================================

        cache.set(
            CACHE_KEY,
            response_data,
            24 * 60 * 60
        )

        return Response(
            response_data
        )

    except Exception as e:

        print(
            "Humidity analysis error:",
            e
        )

        return Response({

            "success":
                False,

            "message":
                "Unable to load humidity analysis.",

            "error":
                str(e),

        }, status=500)