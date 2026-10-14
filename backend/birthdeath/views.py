from django.http import JsonResponse

from .models import (
    BirthCount,
    DeathCount,
    GramPanchayat,
    Municipality,
    MunicipalCorporation,
)


# ======================================================
# DASHBOARD SUMMARY
# ======================================================

def dashboard_summary(request):
    total_birth = sum(
        BirthCount.objects.values_list("total", flat=True)
    )

    total_death = sum(
        DeathCount.objects.values_list("total", flat=True)
    )

    return JsonResponse({
        "districts": BirthCount.objects.count(),
        "births": total_birth,
        "deaths": total_death,
    })


# ======================================================
# DISTRICT SUMMARY
# ======================================================

def district_summary(request, district):
    birth = BirthCount.objects.filter(
        district__iexact=district
    ).first()

    death = DeathCount.objects.filter(
        district__iexact=district
    ).first()

    return JsonResponse({
        "district": district,
        "births": {
            "total": birth.total if birth else 0,
            "male": birth.male if birth else 0,
            "female": birth.female if birth else 0,
            "others": (
                birth.total - birth.male - birth.female
            ) if birth else 0,
        },
        "deaths": {
            "total": death.total if death else 0,
            "male": death.male if death else 0,
            "female": death.female if death else 0,
            "others": (
                death.total - death.male - death.female
            ) if death else 0,
        },
        "gram_panchayats": GramPanchayat.objects.filter(
            district__iexact=district
        ).count(),
        "municipalities": Municipality.objects.filter(
            district__iexact=district
        ).count(),
        "corporations": MunicipalCorporation.objects.filter(
            district__iexact=district
        ).count(),
    })


# ======================================================
# DISTRICT TABLE
# ======================================================

def district_table(request):
    data = []

    for birth in BirthCount.objects.all().order_by("district"):
        death = DeathCount.objects.filter(
            district__iexact=birth.district
        ).first()

        data.append({
            "district": birth.district,
            "births": birth.total,
            "deaths": death.total if death else 0,
            "birth_male": birth.male,
            "birth_female": birth.female,
            "birth_others": birth.total - birth.male - birth.female,
            "death_male": death.male if death else 0,
            "death_female": death.female if death else 0,
            "death_others": (
                death.total - death.male - death.female
            ) if death else 0,
        })

    return JsonResponse(data, safe=False)


# ======================================================
# GRAM PANCHAYATS
# ======================================================

def gram_panchayat_list(request, district):
    data = list(
        GramPanchayat.objects.filter(
            district__iexact=district
        ).order_by("name").values(
            "id",
            "name",
            "birth_total",
            "birth_male",
            "birth_female",
            "death_total",
            "death_male",
            "death_female",
        )
    )

    return JsonResponse(data, safe=False)


# ======================================================
# MUNICIPALITIES
# ======================================================

def municipality_list(request, district):
    data = list(
        Municipality.objects.filter(
            district__iexact=district
        ).order_by("name").values(
            "id",
            "name",
            "birth_total",
            "birth_male",
            "birth_female",
            "death_total",
            "death_male",
            "death_female",
        )
    )

    return JsonResponse(data, safe=False)


# ======================================================
# MUNICIPAL CORPORATIONS
# ======================================================

def corporation_list(request, district):
    data = list(
        MunicipalCorporation.objects.filter(
            district__iexact=district
        ).order_by("name").values(
            "id",
            "name",
            "birth_total",
            "birth_male",
            "birth_female",
            "death_total",
            "death_male",
            "death_female",
        )
    )

    return JsonResponse(data, safe=False)


# ======================================================
# CHART DATA
# ======================================================

def chart_data(request):
    districts = BirthCount.objects.all().order_by("district")

    birth_chart = []
    death_chart = []

    for birth in districts:
        death = DeathCount.objects.filter(
            district__iexact=birth.district
        ).first()

        birth_chart.append({
            "district": birth.district,
            "births": birth.total,
        })

        death_chart.append({
            "district": birth.district,
            "deaths": death.total if death else 0,
        })

    gender = {
        "male": sum(
            BirthCount.objects.values_list(
                "male",
                flat=True,
            )
        ),
        "female": sum(
            BirthCount.objects.values_list(
                "female",
                flat=True,
            )
        ),
    }

    return JsonResponse({
        "birth_chart": birth_chart,
        "death_chart": death_chart,
        "gender": gender,
    })
