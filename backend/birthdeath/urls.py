from django.urls import path

from .views import (
    dashboard_summary,
    district_summary,
    district_table,
    gram_panchayat_list,
    municipality_list,
    corporation_list,
    chart_data,
)

urlpatterns = [

    path(
        "dashboard/",
        dashboard_summary,
        name="dashboard-summary",
    ),

    path(
        "district/<str:district>/",
        district_summary,
        name="district-summary",
    ),

    path(
        "districts/",
        district_table,
        name="district-table",
    ),

    path(
        "gram-panchayats/<str:district>/",
        gram_panchayat_list,
        name="gram-panchayat-list",
    ),

    path(
        "municipalities/<str:district>/",
        municipality_list,
        name="municipality-list",
    ),

    path(
        "corporations/<str:district>/",
        corporation_list,
        name="corporation-list",
    ),

    path(
        "charts/",
        chart_data,
        name="chart-data",
    ),

]