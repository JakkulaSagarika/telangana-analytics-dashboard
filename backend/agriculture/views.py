import json
from pathlib import Path
import geopandas as gpd
from django.http import JsonResponse
PACKAGE_ROOT = Path(__file__).resolve().parent
DISTRICT_SHP = PACKAGE_ROOT / 'data' / 'shapefiles' / '20250818__Telangana_Shape_Files_District_Mandal (1)' / '20250818__Telangana_Shape_Files_District_Mandal' / 'TS_District_Boundary_33' / 'TS_District_Boundary_33_FINAL.shp'
def districts(request):
    gdf = gpd.read_file(DISTRICT_SHP).to_crs(epsg=4326)
    return JsonResponse(json.loads(gdf.to_json()), safe=False)
from django.http import JsonResponse
from django.db.models import Count, Sum

from .models import AgricultureData


def _normalize_agriculture_district(district):
    district = str(district).strip()

    aliases = {
        "Asifabad": "Kumuram Bheem",
        "Komaram Bheem Asifabad": "Kumuram Bheem",
        "Gadwal": "Jogulamba Gadwal",
        "Jagital": "Jagtial",
        "Jangoan": "Jangaon",
        "Jayashanker": "Jayashankar Bhupalapally",
        "Kothagudem": "Bhadradri Kothagudem",
        "Mahabubad": "Mahabubabad",
        "Medchal": "Medchal-Malkajgiri",
        "Medchal Malkajgiri": "Medchal-Malkajgiri",
        "Sircilla": "Rajanna Sircilla",
        "Wanaparathy": "Wanaparthy",
        "Warangal (R)": "Warangal",
        "Warangal (U) Corrected": "Warangal",
        "Warangal (Urban)": "Warangal",
        "Warangal Rural": "Warangal",
        "Yadadri": "Yadadri Bhuvanagiri",
    }

    return aliases.get(district, district)


# ----------------------------------------------------------
# Production Breakdown
# ----------------------------------------------------------

def _production_breakdown(queryset):

    rows = (
        queryset
        .filter(area_production__icontains="Production")
        .values("note")
        .annotate(total=Sum("value"))
        .order_by("-total")
    )

    return [
        {
            "unit": row["note"] or "Other",
            "value": round(float(row["total"] or 0), 2)
        }
        for row in rows
    ]


# ----------------------------------------------------------
# Area Total
# ----------------------------------------------------------

def _area_total(queryset):

    value = (
        queryset
        .filter(area_production__iexact="Area")
        .aggregate(total=Sum("value"))
        .get("total")
    )

    return round(float(value or 0), 2)


# ----------------------------------------------------------
# Crop Analysis
# ----------------------------------------------------------

def _crop_analysis(queryset):

    crops = (
        queryset
        .exclude(crop_name="")
        .values("crop_name")
        .annotate(records=Count("id"))
        .order_by("crop_name")
    )

    result = []

    for crop in crops:

        crop_qs = queryset.filter(
            crop_name=crop["crop_name"]
        )

        production = _production_breakdown(crop_qs)

        result.append({
            "crop": crop["crop_name"],
            "records": crop["records"],
            "area": _area_total(crop_qs),
            "production": round(
                sum(x["value"] for x in production),
                2
            ),
            "production_breakdown": production,
        })

    return result


# ==========================================================
# AGRICULTURE MAIN SUMMARY
# ==========================================================

def agriculture_summary(request):

    total_records = AgricultureData.objects.count()

    district_count = (
        AgricultureData.objects
        .values("district")
        .distinct()
        .count()
    )

    mandal_count = (
        AgricultureData.objects
        .exclude(mandal="")
        .values("mandal")
        .distinct()
        .count()
    )

    crop_count = (
        AgricultureData.objects
        .exclude(crop_name="")
        .values("crop_name")
        .distinct()
        .count()
    )

    years = list(
        AgricultureData.objects
        .values_list("year", flat=True)
        .distinct()
        .order_by("year")
    )

    districts = list(
        AgricultureData.objects
        .values_list("district", flat=True)
        .distinct()
        .order_by("district")
    )

    crops = list(
        AgricultureData.objects
        .exclude(crop_name="")
        .values_list("crop_name", flat=True)
        .distinct()
        .order_by("crop_name")
    )

    all_data = AgricultureData.objects.all()

    return JsonResponse({
        "total_records": total_records,
        "district_count": district_count,
        "mandal_count": mandal_count,
        "crop_count": crop_count,
        "year_count": len(years),
        "years": years,
        "districts": districts,
        "crops": crops,
        "area_total": _area_total(all_data),
        "production_breakdown":
            _production_breakdown(all_data),
    })


# ==========================================================
# AGRICULTURE DISTRICTS
# ==========================================================

def agriculture_districts(request):

    districts = (
        AgricultureData.objects
        .values("district")
        .annotate(
            records=Count("id"),
            mandals=Count(
                "mandal",
                distinct=True
            ),
            crops=Count(
                "crop_name",
                distinct=True
            )
        )
        .order_by("district")
    )

    return JsonResponse(
        [
            {
                "district": x["district"],
                "records": x["records"],
                "mandals": x["mandals"],
                "crops": x["crops"],
            }
            for x in districts
        ],
        safe=False
    )


# ==========================================================
# AGRICULTURE DISTRICT SUMMARY
# ==========================================================

def agriculture_district_summary(request, district):

    district = _normalize_agriculture_district(district)

    selected_year = str(
        request.GET.get("year", "")
    ).strip()

    district_data = AgricultureData.objects.filter(
        district__iexact=district
    )

    if not district_data.exists():

        return JsonResponse(
            {
                "error":
                    "Agriculture data not found",
                "district": district,
            },
            status=404
        )

    years = list(
        district_data
        .values_list("year", flat=True)
        .distinct()
        .order_by("year")
    )

    filtered_data = district_data

    if selected_year:

        filtered_data = district_data.filter(
            year__iexact=selected_year
        )

        if not filtered_data.exists():

            return JsonResponse(
                {
                    "error":
                        "Agriculture data not found for this year",
                    "district": district,
                    "year": selected_year,
                    "years": years,
                },
                status=404
            )

    return JsonResponse({

        "district": district,

        "records":
            filtered_data.count(),

        "mandal_count":
            filtered_data
            .exclude(mandal="")
            .values("mandal")
            .distinct()
            .count(),

        "crop_count":
            filtered_data
            .exclude(crop_name="")
            .values("crop_name")
            .distinct()
            .count(),

        "years": years,

        "selected_year":
            selected_year or None,

        "area_total":
            _area_total(filtered_data),

        "production_breakdown":
            _production_breakdown(filtered_data),

        "crop_analysis":
            _crop_analysis(filtered_data),
    })


# ==========================================================
# AGRICULTURE YEAR SUMMARY
# ==========================================================

def agriculture_year_summary(request, year):
    """
    Agriculture Dashboard Summary for a selected year
    """

    year = year.strip()

    year_data = AgricultureData.objects.filter(
        year__iexact=year
    )

    if not year_data.exists():
        return JsonResponse(
            {
                "error": "Agriculture data not found for this year",
                "year": year,
            },
            status=404
        )

    # ==========================================================
    # BASIC COUNTS
    # ==========================================================

    records = year_data.count()

    district_count = (
        year_data
        .values("district")
        .distinct()
        .count()
    )

    mandal_count = (
        year_data
        .exclude(mandal="")
        .values("mandal")
        .distinct()
        .count()
    )

    crop_count = (
        year_data
        .exclude(crop_name="")
        .values("crop_name")
        .distinct()
        .count()
    )

    # ==========================================================
    # TOTAL AREA
    # ==========================================================

    area_total = (
        year_data
        .filter(
            area_production__iexact="Area"
        )
        .aggregate(total=Sum("value"))
        .get("total")
    )

    # ==========================================================
    # CROP ANALYSIS
    # ==========================================================

    area_rows = (
        year_data
        .filter(
            area_production__iexact="Area"
        )
        .exclude(crop_name="")
        .values("crop_name")
        .annotate(total=Sum("value"))
    )

    production_rows = (
        year_data
        .filter(
            area_production__icontains="Production"
        )
        .exclude(crop_name="")
        .values("crop_name")
        .annotate(total=Sum("value"))
    )

    crop_map = {}

    for item in area_rows:
        crop = item["crop_name"]

        crop_map.setdefault(
            crop,
            {
                "crop": crop,
                "area": 0,
                "production": 0
            }
        )

        crop_map[crop]["area"] = round(
            float(item["total"] or 0),
            2
        )

    for item in production_rows:
        crop = item["crop_name"]

        crop_map.setdefault(
            crop,
            {
                "crop": crop,
                "area": 0,
                "production": 0
            }
        )

        crop_map[crop]["production"] = round(
            float(item["total"] or 0),
            2
        )

    crop_analysis = list(crop_map.values())

    # Sort by production
    top_crops = sorted(
        crop_analysis,
        key=lambda x: x["production"],
        reverse=True
    )

    # ==========================================================
    # DISTRICT ANALYSIS
    # ==========================================================

    district_records = (
        year_data
        .values("district")
        .annotate(
            records=Count("id"),
            mandals=Count(
                "mandal",
                distinct=True
            ),
            crops=Count(
                "crop_name",
                distinct=True
            )
        )
    )

    district_area_rows = (
        year_data
        .filter(
            area_production__iexact="Area"
        )
        .values("district")
        .annotate(total=Sum("value"))
    )

    district_production_rows = (
        year_data
        .filter(
            area_production__icontains="Production"
        )
        .values("district")
        .annotate(total=Sum("value"))
    )

    district_map = {}

    for item in district_records:
        district = item["district"]

        district_map[district] = {
            "district": district,
            "records": item["records"],
            "mandals": item["mandals"],
            "crops": item["crops"],
            "area": 0,
            "production": 0
        }

    for item in district_area_rows:
        district = item["district"]

        if district not in district_map:
            district_map[district] = {
                "district": district,
                "records": 0,
                "mandals": 0,
                "crops": 0,
                "area": 0,
                "production": 0
            }

        district_map[district]["area"] = round(
            float(item["total"] or 0),
            2
        )

    for item in district_production_rows:
        district = item["district"]

        if district not in district_map:
            district_map[district] = {
                "district": district,
                "records": 0,
                "mandals": 0,
                "crops": 0,
                "area": 0,
                "production": 0
            }

        district_map[district]["production"] = round(
            float(item["total"] or 0),
            2
        )

    districts = list(district_map.values())

    # ==========================================================
    # PRODUCTION BREAKDOWN
    # ==========================================================

    production_records = (
        year_data
        .filter(
            area_production__icontains="Production"
        )
        .values("note")
        .annotate(total=Sum("value"))
        .order_by("-total")
    )

    production_breakdown = []

    for item in production_records:
        production_breakdown.append({
            "unit": item["note"] or "Other",
            "value": round(
                float(item["total"] or 0),
                2
            )
        })

    # ==========================================================
    # RESPONSE
    # ==========================================================

    return JsonResponse({
        "year": year,

        "records": records,

        "district_count": district_count,

        "mandal_count": mandal_count,

        "crop_count": crop_count,

        "area_total": round(
            float(area_total or 0),
            2
        ),

        "crop_analysis": crop_analysis,

        "top_crops": top_crops,

        "districts": districts,

        "top_crop_districts": sorted(
            districts,
            key=lambda x: x["production"],
            reverse=True
        )[:10],

        "production_breakdown":
            production_breakdown,
    })

# ==========================================================
# AGRICULTURE DISTRICT MANDALS
# ==========================================================

def agriculture_district_mandals(request, district):

    district = _normalize_agriculture_district(
        district
    )

    selected_year = str(
        request.GET.get("year", "")
    ).strip()

    queryset = AgricultureData.objects.filter(
        district__iexact=district
    )

    if selected_year:

        queryset = queryset.filter(
            year__iexact=selected_year
        )

    data = (
        queryset
        .exclude(mandal="")
        .values("mandal")
        .annotate(
            records=Count("id"),
            crops=Count(
                "crop_name",
                distinct=True
            )
        )
        .order_by("mandal")
    )

    result = []

    for item in data:

        mandal_qs = queryset.filter(
            mandal=item["mandal"]
        )

        production = _production_breakdown(
            mandal_qs
        )

        result.append({

            "mandal":
                item["mandal"],

            "records":
                item["records"],

            "crops":
                item["crops"],

            "area":
                _area_total(mandal_qs),

            "production":
                round(
                    sum(
                        x["value"]
                        for x in production
                    ),
                    2
                ),

            "production_breakdown":
                production,
        })

    return JsonResponse(
        result,
        safe=False
    )


# ==========================================================
# ⭐ DISTRICT-SPECIFIC CROP ANALYSIS
# ==========================================================

def agriculture_district_crops(request, district):

    district = _normalize_agriculture_district(
        district
    )

    selected_year = str(
        request.GET.get("year", "")
    ).strip()

    queryset = AgricultureData.objects.filter(
        district__iexact=district
    )

    if not queryset.exists():

        return JsonResponse(
            {
                "error":
                    "Agriculture data not found",
                "district":
                    district,
            },
            status=404
        )

    if selected_year:

        queryset = queryset.filter(
            year__iexact=selected_year
        )

        if not queryset.exists():

            return JsonResponse(
                {
                    "error":
                        "Agriculture data not found for this year",
                    "district":
                        district,
                    "year":
                        selected_year,
                },
                status=404
            )

    return JsonResponse(
        _crop_analysis(queryset),
        safe=False
    )


# ==========================================================
# ALL AGRICULTURE CROP ANALYSIS
# ==========================================================

def agriculture_crops(request):

    selected_year = str(
        request.GET.get("year", "")
    ).strip()

    queryset = (
        AgricultureData.objects
        .exclude(crop_name="")
    )

    if selected_year:

        queryset = queryset.filter(
            year__iexact=selected_year
        )

    return JsonResponse(
        _crop_analysis(queryset),
        safe=False
    )
    # ==========================================================
# HOME PAGE - SELECTED YEAR AGRICULTURE ANALYTICS
# ==========================================================

def agriculture_year_analytics(request, year):

    year = str(year).strip()

    queryset = AgricultureData.objects.filter(
        year__iexact=year
    )

    if not queryset.exists():
        return JsonResponse(
            {
                "error": f"No agriculture data found for {year}"
            },
            status=404
        )

    # ------------------------------------------------------
    # Crop-wise analysis
    # ------------------------------------------------------

    crop_data = (
        queryset
        .exclude(crop_name="")
        .values("crop_name")
        .annotate(
            records=Count("id")
        )
        .order_by("-records")
    )

    crops = []

    for item in crop_data:

        crop_qs = queryset.filter(
            crop_name=item["crop_name"]
        )

        production = _production_breakdown(crop_qs)

        crops.append({
            "crop": item["crop_name"],
            "records": item["records"],
            "area": _area_total(crop_qs),
            "production": round(
                sum(
                    x["value"]
                    for x in production
                ),
                2
            )
        })

    # Top 10 crops
    top_crops = crops[:10]

    # ------------------------------------------------------
    # Top crop
    # ------------------------------------------------------

    top_crop = (
        top_crops[0]["crop"]
        if top_crops
        else None
    )

    # ------------------------------------------------------
    # Top districts for the top crop
    # ------------------------------------------------------

    top_crop_districts = []

    if top_crop:

        district_data = (
            queryset
            .filter(crop_name=top_crop)
            .values("district")
            .annotate(
                records=Count("id")
            )
            .order_by("-records")[:10]
        )

        for item in district_data:

            district_qs = queryset.filter(
                crop_name=top_crop,
                district=item["district"]
            )

            production = _production_breakdown(
                district_qs
            )

            top_crop_districts.append({
                "district": item["district"],
                "records": item["records"],
                "area": _area_total(
                    district_qs
                ),
                "production": round(
                    sum(
                        x["value"]
                        for x in production
                    ),
                    2
                )
            })

    # ------------------------------------------------------
    # District-wise agriculture analysis
    # ------------------------------------------------------

    district_data = (
        queryset
        .values("district")
        .annotate(
            records=Count("id"),
            mandals=Count(
                "mandal",
                distinct=True
            ),
            crops=Count(
                "crop_name",
                distinct=True
            )
        )
        .order_by("-records")
    )

    districts = []

    for item in district_data:

        district_qs = queryset.filter(
            district=item["district"]
        )

        districts.append({
            "district": item["district"],
            "records": item["records"],
            "mandals": item["mandals"],
            "crops": item["crops"],
            "area": _area_total(
                district_qs
            )
        })

    # ------------------------------------------------------
    # Final response
    # ------------------------------------------------------

    return JsonResponse({

        "year": year,

        "records":
            queryset.count(),

        "district_count":
            queryset
            .values("district")
            .distinct()
            .count(),

        "mandal_count":
            queryset
            .exclude(mandal="")
            .values("mandal")
            .distinct()
            .count(),

        "crop_count":
            queryset
            .exclude(crop_name="")
            .values("crop_name")
            .distinct()
            .count(),

        "area_total":
            _area_total(queryset),

        "top_crop":
            top_crop,

        "crops":
            crops,

        "top_crops":
            top_crops,

        "top_crop_districts":
            top_crop_districts,

        "districts":
            districts,
    })
    
