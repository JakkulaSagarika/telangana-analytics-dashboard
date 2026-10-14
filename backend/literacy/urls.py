from django.urls import path
from . import views
urlpatterns = [path('districts/', views.districts)]