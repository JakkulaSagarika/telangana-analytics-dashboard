from pathlib import Path

import pandas as pd
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from birthdeath.models import (
    BirthCount,
    DeathCount,
    GramPanchayat,
    Municipality,
    MunicipalCorporation,
)


def to_int(value):
    if pd.isna(value):
        return 0
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def import_excel_data(*, replace_existing=True, stdout=None):
    """Load the bundled workbook into the database.

    ``replace_existing`` keeps the management command's original behaviour,
    while allowing application startup to seed only a new, empty database.
    """
    file_path = settings.BASE_DIR.parent / "Dataa" / "Dataa" / "BirthDeathData.xlsx"
    if not file_path.is_file():
        raise CommandError(f"Bundled Excel file was not found: {file_path}")

    birth_df = pd.read_excel(file_path, sheet_name="BIRTH COUNT")
    death_df = pd.read_excel(file_path, sheet_name="DEATH_COUNT")
    gp_df = pd.read_excel(file_path, sheet_name="GRAM PANCHAYAT")
    municipality_df = pd.read_excel(file_path, sheet_name="MUNICIPALITY")
    corporation_df = pd.read_excel(file_path, sheet_name="MUNICIPAL CORPORATIN")

    with transaction.atomic():
        if replace_existing:
            BirthCount.objects.all().delete()
            DeathCount.objects.all().delete()
            GramPanchayat.objects.all().delete()
            Municipality.objects.all().delete()
            MunicipalCorporation.objects.all().delete()
            if stdout:
                stdout.write("Old Data Deleted")

        for _, row in birth_df.iterrows():
            if pd.isna(row["DISTRICT"]):
                continue
            BirthCount.objects.create(
                district=str(row["DISTRICT"]).strip(),
                total=to_int(row["DISTRICT WISE BIRTH COUNT"]),
                male=to_int(row["MALE"]),
                female=to_int(row["FEMALE"]),
            )

        for _, row in death_df.iterrows():
            if pd.isna(row["DISTRICT"]):
                continue
            DeathCount.objects.create(
                district=str(row["DISTRICT"]).strip(),
                total=to_int(row["DISTRICT WISE DEATH COUNT"]),
                male=to_int(row["MALE"]),
                female=to_int(row["FEMALE"]),
            )

        for _, row in gp_df.iterrows():
            if pd.isna(row["GRAM PANCHAYAT NAME"]):
                continue
            GramPanchayat.objects.create(
                district=str(row["DISTRICT"]).strip(),
                name=str(row["GRAM PANCHAYAT NAME"]).strip(),
                birth_total=to_int(row["BIRTH COUNT"]),
                birth_male=to_int(row["MALE"]),
                birth_female=to_int(row["FEMALE"]),
                death_total=to_int(row["DEATH COUNT"]),
                death_male=to_int(row["MALE.1"]),
                death_female=to_int(row["FEMALE.1"]),
            )

        for _, row in municipality_df.iterrows():
            if pd.isna(row[" MUNICIPALITY NAME"]):
                continue
            Municipality.objects.create(
                district=str(row["DISTRICT"]).strip(),
                name=str(row[" MUNICIPALITY NAME"]).strip(),
                birth_total=to_int(row["BIRTH COUNT"]),
                birth_male=to_int(row["MALE"]),
                birth_female=to_int(row["FEMALE"]),
                death_total=to_int(row["DEATH COUNT"]),
                death_male=to_int(row["MALE.1"]),
                death_female=to_int(row["FEMALE.1"]),
            )

        for _, row in corporation_df.iterrows():
            if pd.isna(row["MUNICIPAL CORPORATIN NAME"]):
                continue
            MunicipalCorporation.objects.create(
                district=str(row["DISTRICT"]).strip(),
                name=str(row["MUNICIPAL CORPORATIN NAME"]).strip(),
                birth_total=to_int(row["BIRTH COUNT"]),
                birth_male=to_int(row["MALE"]),
                birth_female=to_int(row["FEMALE"]),
                death_total=to_int(row["DEATH COUNT"]),
                death_male=to_int(row["MALE.1"]),
                death_female=to_int(row["FEMALE.1"]),
            )


class Command(BaseCommand):
    help = "Import Birth & Death Data"

    def handle(self, *args, **kwargs):
        import_excel_data(stdout=self.stdout)

        self.stdout.write(
            self.style.SUCCESS(
                "\n=========================================\n"
                " COMPLETE DATA IMPORTED SUCCESSFULLY\n"
                "=========================================\n"
            )
        )
