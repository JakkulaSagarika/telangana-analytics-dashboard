from django.urls import path
from .views import *

urlpatterns = [

    # ==========================
    # Dashboard
    # ==========================

    path(
        "dashboard-summary/",
        dashboard_summary,
    ),

    path(
        "records/",
        all_records,
    ),

    # ==========================
    # Charts
    # ==========================

    path(
        "charts/gender/",
        gender_chart,
    ),

    path(
        "charts/district/",
        district_chart,
    ),

    path(
        "charts/monthly/",
        monthly_chart,
    ),

    path(
        "charts/age-groups/",
        age_group_chart,
    ),

    path(
        "charts/age-insights/",
        age_insights,
    ),

    path(
        "charts/top-facilities/",
        top_facilities_chart,
    ),

    path(
        "charts/monthly-top-facilities/",
        monthly_top_facilities,
    ),

    path(
        "charts/district-patients/",
        district_patient_chart,
    ),
    path(
    "charts/district-average-age/",
    district_average_age,
),

    path(
        "charts/rbc-trend/",
        rbc_trend,
    ),

    path(
        "charts/wbc-trend/",
        wbc_trend,
    ),

    path(
        "charts/platelet-trend/",
        platelet_trend,
    ),

    path(
        "charts/facilities/",
        facility_analysis,
    ),

    # ==========================
    # Map
    # ==========================

    path(
        "map-data/",
        map_data,
    ),

    # ==========================
    # Filters
    # ==========================

    path(
        "filters/",
        filters,
    ),

    path(
        "filter-data/",
        filter_data,
    ),

    # ==========================
    # District Analysis
    # ==========================

    path(
        "district-summary/",
        district_summary,
    ),

    path(
        "district-insights/",
        district_insights,
    ),

    path(
        "district-ranking/",
        district_ranking,
    ),

    # ==========================
    # Analytics
    # ==========================

    path(
        "analytics-summary/",
        analytics_summary,
    ),

    path(
        "analytics-kpis/",
        analytics_kpis,
    ),

]