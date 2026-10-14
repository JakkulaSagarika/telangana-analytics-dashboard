from django.contrib import admin

from .models import (
    BirthCount,
    DeathCount,
    GramPanchayat,
    Municipality,
    MunicipalCorporation,
)

admin.site.register(BirthCount)
admin.site.register(DeathCount)
admin.site.register(GramPanchayat)
admin.site.register(Municipality)
admin.site.register(MunicipalCorporation)