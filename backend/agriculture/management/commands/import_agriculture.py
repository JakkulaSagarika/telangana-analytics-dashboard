import csv
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from agriculture.models import AgricultureData


class Command(BaseCommand):
    help = "Import all Telangana Agriculture CSV files into PostgreSQL"

    def handle(self, *args, **options):
        base_dir = (
            Path(__file__).resolve().parents[4]
            / "Dataa"
            / "Dataa"
            / "Agri"
        )

        files = [
            base_dir / "horticulture-Mandal_wise_Crop_Area_Production_and_Yield_data _2019-20.csv",
            base_dir / "horticulture-Mandal_wise_Crop_Area_Production_and_Yield_data _2020-21.csv",
            base_dir / "horticulture-Mandal_wise_Crop_Area_Production_and_Yield_data _2021-22.csv",
            base_dir / "horticulture-Mandal_wise_Crop_Area_Production_and_Yield_data _2022-23.csv",
        ]

        total_imported = 0

        for file_path in files:
            if not file_path.exists():
                self.stdout.write(
                    self.style.ERROR(f"File not found: {file_path}")
                )
                continue

            self.stdout.write(f"\nImporting: {file_path.name}")

            records = []

            with open(
                file_path,
                "r",
                encoding="utf-8-sig",
                newline="",
            ) as csv_file:

                reader = csv.DictReader(csv_file)

                for row in reader:
                    records.append(
                        AgricultureData(
                            year=str(row.get("year", "")).strip(),
                            district=str(row.get("district", "")).strip(),
                            division=str(row.get("division", "")).strip(),
                            mandal=str(row.get("mandal", "")).strip(),
                            crop_type=str(row.get("crop_type", "")).strip(),
                            crop_name=str(row.get("crop_name", "")).strip(),
                            season=str(row.get("season", "") or "").strip(),
                            area_production=str(
                                row.get("area_production", "")
                            ).strip(),
                            value=self.parse_float(row.get("value")),
                            note=str(row.get("note", "") or "").strip(),
                        )
                    )

            with transaction.atomic():
                AgricultureData.objects.bulk_create(
                    records,
                    batch_size=2000,
                )

            total_imported += len(records)

            self.stdout.write(
                self.style.SUCCESS(
                    f"Imported {len(records):,} records"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nTotal Agriculture records imported: {total_imported:,}"
            )
        )

    @staticmethod
    def parse_float(value):
        if value is None:
            return None

        value = str(value).strip()

        if not value:
            return None

        try:
            return float(value.replace(",", ""))
        except (ValueError, TypeError):
            return None