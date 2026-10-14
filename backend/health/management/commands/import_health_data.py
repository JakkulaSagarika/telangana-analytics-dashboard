from django.core.management.base import BaseCommand
from django.conf import settings
from health.models import HealthRecord
from health.utils import load_health_excel

from datetime import datetime
import re


class Command(BaseCommand):
    help = "Import Telangana Health Excel using openpyxl"

    def to_float(self, value):

        if value is None:
            return 0.0

        value = str(value).strip().lower()

        if value in ["", "-", "na", "n/a", "none", "nil", "nan"]:
            return 0.0

        value = value.replace(" ", "")

        mapping = {
            "withinnormallimits": 1.0,
            "normal": 1.0,
            "plenty": 100.0,
            "plenty/hpf": 100.0,
            "many": 80.0,
            "many/hpf": 80.0,
            "few": 5.0,
            "few/hpf": 5.0,
            "rare": 1.0,
            "occasional": 2.0,
            "thrombocytosis": 500.0,
        }

        if value in mapping:
            return mapping[value]

        match = re.search(r"(\d+)\s*-\s*(\d+)", value)

        if match:
            low = float(match.group(1))
            high = float(match.group(2))
            return (low + high) / 2

        match = re.search(r"(\d+)", value)

        if match:
            return float(match.group(1))

        return 0.0

    def to_int(self, value):

        if value is None:
            return 0

        value = str(value).strip()

        if value.lower() in [
            "",
            "-",
            "na",
            "n/a",
            "none",
            "nil",
            "nan",
        ]:
            return 0

        try:
            return int(float(value))
        except:
            return 0

    def to_date(self, value):

        if value is None:
            return None

        if isinstance(value, datetime):
            return value.date()

        if hasattr(value, "date"):
            return value.date()

        value = str(value).strip()

        formats = [
            "%Y-%m-%d",
            "%d-%m-%Y",
            "%d/%m/%Y",
            "%m/%d/%Y",
        ]

        for fmt in formats:
            try:
                return datetime.strptime(value, fmt).date()
            except:
                pass

        return None

    def handle(self, *args, **kwargs):

        # Path to Telangana Health Department Excel file
        file_path = (
            settings.BASE_DIR.parent
            / "Dataa"
            / "Dataa"
            / "Telangana Health Department(1).xlsx"
        )

        workbook = load_health_excel(file_path)

        imported = 0
        skipped = 0

        for sheet in workbook.sheetnames:

            worksheet = workbook[sheet]

            rows = list(worksheet.iter_rows(values_only=True))

            if not rows:
                continue

            headers = rows[0]

            for row in rows[1:]:

                try:

                    data = dict(zip(headers, row))

                    HealthRecord.objects.update_or_create(

                        unique_id=str(data["uniqueId"]),

                        defaults={

                            "month": sheet,

                            "date": self.to_date(
                                data["date"]
                            ),

                            "district_name": str(
                                data["districtName"]
                            ).strip(),

                            "facility_name": str(
                                data["facilityName"]
                            ).strip(),

                            "age": self.to_int(
                                data["age"]
                            ),

                            "gender": str(
                                data["gender"]
                            ).strip(),

                            "red_blood_cells": self.to_float(
                                data["Red Blood Cells"]
                            ),

                            "white_blood_cells": self.to_float(
                                data["White Blood Cells"]
                            ),

                            "thrombocytes": self.to_float(
                                data["Thrombocytes"]
                            ),
                        },
                    )

                    imported += 1

                except Exception as e:

                    skipped += 1

                    print(
                        f"Sheet {sheet} -> {e}"
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nImported : {imported}\nSkipped : {skipped}"
            )
        )