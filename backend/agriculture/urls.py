from django.urls import path
from . import views
urlpatterns = [
    path('districts/', views.districts),
    path('summary/', views.agriculture_summary),
    path('summary/<str:year>/', views.agriculture_year_summary),
    path('data/districts/', views.agriculture_districts),
    path('district/<str:district>/', views.agriculture_district_summary),
    path('district/<str:district>/mandals/', views.agriculture_district_mandals),
    path('district/<str:district>/crops/', views.agriculture_district_crops),
    path('crops/', views.agriculture_crops),
    path('year/<str:year>/analytics/', views.agriculture_year_analytics),
]
