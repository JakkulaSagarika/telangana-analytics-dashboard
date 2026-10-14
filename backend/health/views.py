from django.db.models import Count, Avg, Q
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import HealthRecord
from .serializers import HealthRecordSerializer


# =====================================================
# COMMON FILTER
# =====================================================

def get_filtered_records(request):

    records = HealthRecord.objects.all()

    district = request.GET.get("district")
    month = request.GET.get("month")
    gender = request.GET.get("gender")
    search = request.GET.get("search")

    if district and district != "All":
        records = records.filter(district_name=district)

    if month and month != "All":
        records = records.filter(month=month)

    if gender and gender != "All":
        records = records.filter(gender__iexact=gender)

    if search:
        records = records.filter(
            Q(facility_name__icontains=search) |
            Q(district_name__icontains=search) |
            Q(unique_id__icontains=search)
        )

    return records


# =====================================================
# DASHBOARD SUMMARY
# =====================================================

@api_view(["GET"])
def dashboard_summary(request):

    qs = get_filtered_records(request)

    summary = qs.aggregate(
        total_records=Count("id"),
        male=Count("id", filter=Q(gender__iexact="M")),
        female=Count("id", filter=Q(gender__iexact="F")),
        average_age=Avg("age"),
    )

    return Response({

        "total_records": summary["total_records"] or 0,

        "male": summary["male"] or 0,

        "female": summary["female"] or 0,

        "average_age": round(
            summary["average_age"] or 0,
            1
        ),

    })


# =====================================================
# ALL RECORDS
# =====================================================

@api_view(["GET"])
def all_records(request):

    qs = get_filtered_records(request)

    serializer = HealthRecordSerializer(
        qs[:200],
        many=True
    )

    return Response(serializer.data)


# =====================================================
# FILTER DROPDOWNS
# =====================================================

@api_view(["GET"])
def filters(request):

    districts = list(
        HealthRecord.objects
        .exclude(district_name__isnull=True)
        .exclude(district_name="")
        .values_list(
            "district_name",
            flat=True
        )
        .distinct()
        .order_by("district_name")
    )

    months = list(
        HealthRecord.objects
        .exclude(month__isnull=True)
        .exclude(month="")
        .values_list(
            "month",
            flat=True
        )
        .distinct()
        .order_by("month")
    )

    genders = list(
        HealthRecord.objects
        .exclude(gender__isnull=True)
        .exclude(gender="")
        .values_list(
            "gender",
            flat=True
        )
        .distinct()
        .order_by("gender")
    )

    return Response({

        "districts": districts,

        "months": months,

        "genders": genders,

    })


# =====================================================
# FILTER DATA
# =====================================================

@api_view(["GET"])
def filter_data(request):

    qs = get_filtered_records(request)

    summary = qs.aggregate(

        total_records=Count("id"),

        male=Count(
            "id",
            filter=Q(gender__iexact="M")
        ),

        female=Count(
            "id",
            filter=Q(gender__iexact="F")
        ),

        average_age=Avg("age"),

        avg_rbc=Avg("red_blood_cells"),

        avg_wbc=Avg("white_blood_cells"),

        avg_platelets=Avg("thrombocytes"),

    )

    serializer = HealthRecordSerializer(
        qs[:200],
        many=True
    )

    return Response({

        "summary": {

            "total_records":
                summary["total_records"] or 0,

            "male":
                summary["male"] or 0,

            "female":
                summary["female"] or 0,

            "average_age":
                round(summary["average_age"] or 0, 1),

            "avg_rbc":
                round(summary["avg_rbc"] or 0, 2),

            "avg_wbc":
                round(summary["avg_wbc"] or 0, 2),

            "avg_platelets":
                round(summary["avg_platelets"] or 0, 2),

        },

        "records": serializer.data,

    })
    # =====================================================
# GENDER CHART
# =====================================================

@api_view(["GET"])
def gender_chart(request):

    qs = get_filtered_records(request)

    data = (
        qs.values("gender")
        .annotate(count=Count("id"))
        .order_by("gender")
    )

    return Response(data)


# =====================================================
# DISTRICT CHART
# =====================================================

@api_view(["GET"])
def district_chart(request):

    qs = get_filtered_records(request)

    data = (
        qs.values("district_name")
        .annotate(
            total=Count("id"),
            male=Count("id", filter=Q(gender__iexact="M")),
            female=Count("id", filter=Q(gender__iexact="F")),
            avg_rbc=Avg("red_blood_cells"),
            avg_wbc=Avg("white_blood_cells"),
            avg_platelets=Avg("thrombocytes"),
        )
        .order_by("district_name")
    )

    return Response([
        {
            "district_name": row["district_name"],
            "total": row["total"],
            "male": row["male"],
            "female": row["female"],
            "avg_rbc": round(row["avg_rbc"] or 0, 2),
            "avg_wbc": round(row["avg_wbc"] or 0, 2),
            "avg_platelets": round(row["avg_platelets"] or 0, 2),
        }
        for row in data
    ])


# =====================================================
# MONTHLY CHART
# =====================================================

@api_view(["GET"])
def monthly_chart(request):

    qs = get_filtered_records(request)

    data = (
        qs.values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )

    return Response(data)


# =====================================================
# AGE GROUP CHART
# =====================================================

@api_view(["GET"])
def age_group_chart(request):

    qs = get_filtered_records(request).exclude(age__isnull=True)

    groups = qs.aggregate(

        group_0_18=Count(
            "id",
            filter=Q(age__lte=18)
        ),

        group_19_35=Count(
            "id",
            filter=Q(age__gte=19, age__lte=35)
        ),

        group_36_50=Count(
            "id",
            filter=Q(age__gte=36, age__lte=50)
        ),

        group_51_65=Count(
            "id",
            filter=Q(age__gte=51, age__lte=65)
        ),

        group_65_plus=Count(
            "id",
            filter=Q(age__gt=65)
        ),

    )

    return Response({

        "0-18": groups["group_0_18"] or 0,

        "19-35": groups["group_19_35"] or 0,

        "36-50": groups["group_36_50"] or 0,

        "51-65": groups["group_51_65"] or 0,

        "65+": groups["group_65_plus"] or 0,

    })


# =====================================================
# AGE INSIGHTS
# =====================================================

@api_view(["GET"])
def age_insights(request):

    qs = get_filtered_records(request).exclude(age__isnull=True)

    groups = {

        "0-18": qs.filter(age__lte=18),

        "19-35": qs.filter(age__gte=19, age__lte=35),

        "36-50": qs.filter(age__gte=36, age__lte=50),

        "51-65": qs.filter(age__gte=51, age__lte=65),

        "65+": qs.filter(age__gt=65),

    }

    stats = {}

    for name, records in groups.items():

        values = records.aggregate(

            patients=Count("id"),

            avg_rbc=Avg("red_blood_cells"),

            avg_wbc=Avg("white_blood_cells"),

            avg_platelets=Avg("thrombocytes"),

        )

        stats[name] = {

            "patients": values["patients"] or 0,

            "avg_rbc": round(values["avg_rbc"] or 0, 2),

            "avg_wbc": round(values["avg_wbc"] or 0, 2),

            "avg_platelets": round(values["avg_platelets"] or 0, 2),

        }

    return Response({

        "highest_rbc": max(
            stats.items(),
            key=lambda x: x[1]["avg_rbc"]
        ),

        "highest_wbc": max(
            stats.items(),
            key=lambda x: x[1]["avg_wbc"]
        ),

        "highest_platelets": max(
            stats.items(),
            key=lambda x: x[1]["avg_platelets"]
        ),

        "largest_group": max(
            stats.items(),
            key=lambda x: x[1]["patients"]
        ),

    })


# =====================================================
# RBC TREND
# =====================================================

@api_view(["GET"])
def rbc_trend(request):

    qs = get_filtered_records(request)

    return Response(

        qs.values("month")

        .annotate(value=Avg("red_blood_cells"))

        .order_by("month")

    )


# =====================================================
# WBC TREND
# =====================================================

@api_view(["GET"])
def wbc_trend(request):

    qs = get_filtered_records(request)

    return Response(

        qs.values("month")

        .annotate(value=Avg("white_blood_cells"))

        .order_by("month")

    )


# =====================================================
# PLATELET TREND
# =====================================================

@api_view(["GET"])
def platelet_trend(request):

    qs = get_filtered_records(request)

    return Response(

        qs.values("month")

        .annotate(value=Avg("thrombocytes"))

        .order_by("month")

    )# =====================================================
# MAP DATA
# =====================================================

@api_view(["GET"])
def map_data(request):

    qs = get_filtered_records(request)

    data = (
        qs.values("district_name")
        .annotate(
            total=Count("id"),
            male=Count("id", filter=Q(gender__iexact="M")),
            female=Count("id", filter=Q(gender__iexact="F")),
            average_age=Avg("age"),
            avg_rbc=Avg("red_blood_cells"),
            avg_wbc=Avg("white_blood_cells"),
            avg_platelets=Avg("thrombocytes"),
        )
        .order_by("district_name")
    )

    return Response([
        {
            "district": row["district_name"],
            "total": row["total"],
            "male": row["male"],
            "female": row["female"],
            "average_age": round(row["average_age"] or 0,1),
            "avg_rbc": round(row["avg_rbc"] or 0,2),
            "avg_wbc": round(row["avg_wbc"] or 0,2),
            "avg_platelets": round(row["avg_platelets"] or 0,2),
        }
        for row in data
    ])


# =====================================================
# DISTRICT SUMMARY
# =====================================================

@api_view(["GET"])
def district_summary(request):

    qs = get_filtered_records(request)

    summary = qs.aggregate(
        average_age=Avg("age"),
        average_rbc=Avg("red_blood_cells"),
        average_wbc=Avg("white_blood_cells"),
        average_platelets=Avg("thrombocytes"),
    )

    return Response({

        "total_patients": qs.count(),

        "male": qs.filter(gender__iexact="M").count(),

        "female": qs.filter(gender__iexact="F").count(),

        "average_age": round(
            summary["average_age"] or 0,
            2
        ),

        "average_rbc": round(
            summary["average_rbc"] or 0,
            2
        ),

        "average_wbc": round(
            summary["average_wbc"] or 0,
            2
        ),

        "average_platelets": round(
            summary["average_platelets"] or 0,
            2
        ),

        "facilities": qs.values(
            "facility_name"
        ).distinct().count(),

    })


# =====================================================
# DISTRICT INSIGHTS
# =====================================================

@api_view(["GET"])
def district_insights(request):

    qs = get_filtered_records(request)

    highest_month = (
        qs.values("month")
        .annotate(total=Count("id"))
        .order_by("-total")
        .first()
    )

    age_groups = {

        "0-10": qs.filter(age__lte=10).count(),

        "11-20": qs.filter(age__gte=11, age__lte=20).count(),

        "21-40": qs.filter(age__gte=21, age__lte=40).count(),

        "41-60": qs.filter(age__gte=41, age__lte=60).count(),

        "60+": qs.filter(age__gt=60).count(),

    }

    largest_group = max(
        age_groups,
        key=age_groups.get
    )

    return Response({

        "highest_month":
            highest_month["month"] if highest_month else "",

        "largest_age_group":
            largest_group,

        "summary":
            f"Most patients belong to the {largest_group} age group. "
            f"The highest patient load occurred during "
            f"{highest_month['month'] if highest_month else 'N/A'}."

    })


# =====================================================
# FACILITY ANALYSIS
# =====================================================

@api_view(["GET"])
def facility_analysis(request):

    qs = get_filtered_records(request)

    data = (
        qs.values("facility_name")
        .annotate(
            patients=Count("id"),
            male=Count("id", filter=Q(gender__iexact="M")),
            female=Count("id", filter=Q(gender__iexact="F")),
            average_age=Avg("age"),
        )
        .order_by("-patients")[:10]
    )

    return Response([
        {
            "facility_name": row["facility_name"],
            "patients": row["patients"],
            "male": row["male"],
            "female": row["female"],
            "average_age": round(row["average_age"] or 0, 1),
        }
        for row in data
    ])
# =====================================================
# DISTRICT RANKING
# =====================================================

@api_view(["GET"])
def district_ranking(request):

    qs = get_filtered_records(request)

    data = (

        qs.values("district_name")

        .annotate(

            patients=Count("id"),

            male=Count(
                "id",
                filter=Q(gender__iexact="M")
            ),

            female=Count(
                "id",
                filter=Q(gender__iexact="F")
            ),

            average_age=Avg("age"),

        )

        .order_by("-patients")

    )

    return Response(data)
    # =====================================================
# TOP FACILITIES CHART
# =====================================================

@api_view(["GET"])
def top_facilities_chart(request):

    qs = get_filtered_records(request)

    data = (
        qs.values("facility_name")
        .annotate(count=Count("id"))
        .order_by("-count")[:10]
    )

    return Response(data)


# =====================================================
# MONTHLY TOP FACILITIES
# =====================================================

@api_view(["GET"])
def monthly_top_facilities(request):

    qs = get_filtered_records(request)

    rows = (
        qs.values("month", "facility_name")
        .annotate(count=Count("id"))
        .order_by("month", "-count")
    )

    top_by_month = []
    seen_months = set()

    for row in rows:
        month = row["month"]
        if month in seen_months:
            continue

        seen_months.add(month)
        top_by_month.append(
            {
                "month": month,
                "facility_name": row["facility_name"],
                "patients": row["count"],
            }
        )

    return Response(top_by_month)


# =====================================================
# DISTRICT PATIENT CHART
# =====================================================

@api_view(["GET"])
def district_patient_chart(request):

    qs = get_filtered_records(request)

    data = (
        qs.values("district_name")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    return Response(data)


# =====================================================
# ANALYTICS SUMMARY
# =====================================================

@api_view(["GET"])
def analytics_summary(request):

    qs = get_filtered_records(request)

    total_patients = qs.count()

    total_facilities = (
        qs.values("facility_name")
        .distinct()
        .count()
    )

    # Highest Patient District
    highest_district = (
        qs.values("district_name")
        .annotate(total=Count("id"))
        .order_by("-total")
        .first()
    )

    # Highest Testing Facility
    highest_facility = (
        qs.values("facility_name")
        .annotate(total=Count("id"))
        .order_by("-total")
        .first()
    )

    # Highest Patient Month
    highest_month = (
        qs.values("month")
        .annotate(total=Count("id"))
        .order_by("-total")
        .first()
    )

    # Lowest Patient Month
    lowest_month = (
        qs.values("month")
        .annotate(total=Count("id"))
        .order_by("total")
        .first()
    )

    # Male / Female Counts
    male = qs.filter(
        gender__iexact="M"
    ).count()

    female = qs.filter(
        gender__iexact="F"
    ).count()

    total_gender = male + female

    if total_gender:

        male_percent = round(
            male / total_gender * 100,
            1
        )

        female_percent = round(
            female / total_gender * 100,
            1
        )

    else:

        male_percent = 0
        female_percent = 0

    # Average Patients per Facility

    avg_patients_per_facility = (
        round(total_patients / total_facilities, 1)
        if total_facilities else 0
    )

    # Month over Month Growth

    monthly = list(

        qs.values("month")

        .annotate(total=Count("id"))

        .order_by("month")

    )

    # =====================================
    # Top Two Age Groups
    # =====================================

    age_groups = {

        "0-18 Years": qs.filter(age__lte=18).count(),

        "19-35 Years": qs.filter(age__gte=19, age__lte=35).count(),

        "36-50 Years": qs.filter(age__gte=36, age__lte=50).count(),

        "51-65 Years": qs.filter(age__gte=51, age__lte=65).count(),

        "65+ Years": qs.filter(age__gt=65).count(),

    }

    top_age_groups = sorted(

        age_groups.items(),

        key=lambda x: x[1],

        reverse=True,

    )

    growth = 0

    if len(monthly) >= 2:

        previous = monthly[-2]["total"]

        current = monthly[-1]["total"]

        if previous > 0:

            growth = round(

                ((current - previous) / previous) * 100,

                1,

            )

    return Response({

        "highest_growth_month":
            highest_month["month"] if highest_month else "-",

        "highest_patient_district":
            highest_district["district_name"] if highest_district else "-",

        "lowest_patient_month":
            lowest_month["month"] if lowest_month else "-",

        "highest_testing_facility":
            highest_facility["facility_name"] if highest_facility else "-",

        "male_percent":
            male_percent,

        "female_percent":
            female_percent,

        "avg_patients_per_facility":
            avg_patients_per_facility,

        "month_growth":
            growth,

        # ===============================
        # Age Group Insights
        # ===============================

        "highest_age_group":
            top_age_groups[0][0],

        "highest_age_group_patients":
            top_age_groups[0][1],

        "second_highest_age_group":
            top_age_groups[1][0],

        "second_highest_age_group_patients":
            top_age_groups[1][1],

    })
    # =====================================================
# ANALYTICS KPIs
# =====================================================

@api_view(["GET"])
def analytics_kpis(request):

    qs = get_filtered_records(request)

    return Response({

        "total_patients":
            qs.count(),

        "male":
            qs.filter(
                gender__iexact="M"
            ).count(),

        "female":
            qs.filter(
                gender__iexact="F"
            ).count(),

        "average_age":
            round(
                qs.aggregate(
                    Avg("age")
                )["age__avg"] or 0,
                1,
            ),

        "facility_count":
            qs.values(
                "facility_name"
            ).distinct().count(),

        "district_count":
            qs.values(
                "district_name"
            ).distinct().count(),

        "month_count":
            qs.values(
                "month"
            ).distinct().count(),

    })
    # =====================================================
# DISTRICT AVERAGE AGE CHART
# =====================================================

@api_view(["GET"])
def district_average_age(request):

    qs = get_filtered_records(request)

    data = (
        qs.values("district_name")
        .annotate(
            average_age=Avg("age"),
            patients=Count("id")
        )
        .order_by("-average_age")
    )

    return Response([
        {
            "district_name": row["district_name"],
            "average_age": round(row["average_age"] or 0, 1),
            "patients": row["patients"],
        }
        for row in data
    ])