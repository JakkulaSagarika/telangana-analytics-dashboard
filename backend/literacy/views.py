import json
from pathlib import Path
import geopandas as gpd
from django.http import JsonResponse
PACKAGE_ROOT = Path(__file__).resolve().parent
DISTRICT_SHP = PACKAGE_ROOT / 'data' / 'shapefiles' / '20250818__Telangana_Shape_Files_District_Mandal (1)' / '20250818__Telangana_Shape_Files_District_Mandal' / 'TS_District_Boundary_33' / 'TS_District_Boundary_33_FINAL.shp'
def districts(request):
    gdf = gpd.read_file(DISTRICT_SHP).to_crs(epsg=4326)
    return JsonResponse(json.loads(gdf.to_json()), safe=False)
