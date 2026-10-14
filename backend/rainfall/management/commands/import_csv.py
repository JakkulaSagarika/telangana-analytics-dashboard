import os

import pandas as pd

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from rainfall.models import RainfallRecord


class Command(BaseCommand):

    help = "Import Telangana climate data from CSV"

    def handle(self, *args, **options):

        # ============================================================
        # CSV FILE PATH
        # ============================================================

        file_path = (settings.BASE_DIR.parent/ "Dataa"/ "Dataa"/ "rainfall_combined_output.csv")
        if not os.path.exists(file_path):

            self.stdout.write(
                self.style.ERROR(
                    f"CSV file not found:\n{file_path}"
                )
            )

            return

        self.stdout.write(
            self.style.SUCCESS(
                f"CSV file found:\n{file_path}"
            )
        )

        # ============================================================
        # READ CSV
        # ============================================================

        self.stdout.write(
            "Reading CSV file..."
        )

        df = pd.read_csv(
            file_path,
            low_memory=False
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Rows found: {len(df):,}"
            )
        )

        # ============================================================
        # CLEAN COLUMN NAMES
        # ============================================================

        df.columns = (
            df.columns
            .astype(str)
            .str.strip()
            .str.lower()
        )

        # ============================================================
        # REQUIRED COLUMNS
        # ============================================================

        required_columns = [
            "district",
            "mandal",
            "date",
            "rainfall",
            "temp_min",
            "temp_max",
            "humidity_min",
            "humidity_max",
            "wind_speed_min",
            "wind_speed_max",
        ]

        missing_columns = [
            column
            for column in required_columns
            if column not in df.columns
        ]

        if missing_columns:

            self.stdout.write(
                self.style.ERROR(
                    "The following columns are missing:"
                )
            )

            for column in missing_columns:
                self.stdout.write(
                    f"  - {column}"
                )

            self.stdout.write(
                "\nColumns found in CSV:"
            )

            for column in df.columns:
                self.stdout.write(
                    f"  - {column}"
                )

            return

        # ============================================================
        # DATE CONVERSION
        # ============================================================

        self.stdout.write(
            "Converting dates..."
        )

        df["date"] = pd.to_datetime(
            df["date"],
            format="mixed",
            dayfirst=True,
            errors="coerce"
        )

        invalid_dates = int(
            df["date"].isna().sum()
        )

        if invalid_dates > 0:

            self.stdout.write(
                self.style.WARNING(
                    f"Skipping {invalid_dates:,} rows "
                    f"with invalid dates."
                )
            )

            df = df.dropna(
                subset=["date"]
            )

        # ============================================================
        # DISTRICT / MANDAL
        # ============================================================

        df["district"] = (
            df["district"]
            .fillna("")
            .astype(str)
            .str.strip()
        )

        df["mandal"] = (
            df["mandal"]
            .fillna("")
            .astype(str)
            .str.strip()
        )

        # Remove rows without district or mandal

        df = df[
            (df["district"] != "") &
            (df["mandal"] != "")
        ]

        # ============================================================
        # NUMERIC COLUMNS
        # ============================================================

        numeric_columns = [
            "rainfall",
            "temp_min",
            "temp_max",
            "humidity_min",
            "humidity_max",
            "wind_speed_min",
            "wind_speed_max",
        ]

        for column in numeric_columns:

            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            )

        # ============================================================
        # RAINFALL
        # ============================================================

        # Missing rainfall becomes 0

        df["rainfall"] = (
            df["rainfall"]
            .fillna(0)
        )

        # Negative rainfall is invalid

        df.loc[
            df["rainfall"] < 0,
            "rainfall"
        ] = 0

        # ============================================================
        # TEMPERATURE / HUMIDITY / WIND
        # ============================================================

        nullable_columns = [
            "temp_min",
            "temp_max",
            "humidity_min",
            "humidity_max",
            "wind_speed_min",
            "wind_speed_max",
        ]

        for column in nullable_columns:

            # Treat negative values such as -1 as missing

            df.loc[
                df[column] < 0,
                column
            ] = None

        # ============================================================
        # DUPLICATE RECORDS
        # ============================================================

        duplicate_count = int(
            df.duplicated(
                subset=[
                    "district",
                    "mandal",
                    "date"
                ],
                keep=False
            ).sum()
        )

        if duplicate_count > 0:

            self.stdout.write(
                self.style.WARNING(
                    f"Duplicate rows found: "
                    f"{duplicate_count:,}"
                )
            )

            self.stdout.write(
                "Aggregating duplicate records..."
            )

            # IMPORTANT:
            # Rainfall is summed.
            # Temperature, humidity and wind values
            # are averaged.

            df = (
                df.groupby(
                    [
                        "district",
                        "mandal",
                        "date"
                    ],
                    as_index=False
                )
                .agg(
                    rainfall=(
                        "rainfall",
                        "sum"
                    ),

                    temp_min=(
                        "temp_min",
                        "mean"
                    ),

                    temp_max=(
                        "temp_max",
                        "mean"
                    ),

                    humidity_min=(
                        "humidity_min",
                        "mean"
                    ),

                    humidity_max=(
                        "humidity_max",
                        "mean"
                    ),

                    wind_speed_min=(
                        "wind_speed_min",
                        "mean"
                    ),

                    wind_speed_max=(
                        "wind_speed_max",
                        "mean"
                    ),
                )
            )

        # ============================================================
        # AVAILABLE YEARS
        # ============================================================

        years = sorted(
            df["date"]
            .dt.year
            .dropna()
            .unique()
            .tolist()
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Years found: {years}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Final rows to import: {len(df):,}"
            )
        )

        # ============================================================
        # REMOVE OLD DATABASE RECORDS
        # ============================================================

        existing_count = (
            RainfallRecord.objects.count()
        )

        if existing_count > 0:

            self.stdout.write(
                self.style.WARNING(
                    f"Existing database records: "
                    f"{existing_count:,}"
                )
            )

            self.stdout.write(
                "Removing old records..."
            )

            RainfallRecord.objects.all().delete()

        # ============================================================
        # PREPARE RECORDS
        # ============================================================

        self.stdout.write(
            "Preparing database records..."
        )

        records = []

        for row in df.itertuples(
            index=False
        ):

            records.append(
                RainfallRecord(

                    district=str(
                        row.district
                    ).strip(),

                    mandal=str(
                        row.mandal
                    ).strip(),

                    date=row.date.date(),

                    rain_mm=float(
                        row.rainfall
                    ),

                    min_temperature=(
                        float(row.temp_min)
                        if pd.notna(row.temp_min)
                        else None
                    ),

                    max_temperature=(
                        float(row.temp_max)
                        if pd.notna(row.temp_max)
                        else None
                    ),

                    min_humidity=(
                        float(row.humidity_min)
                        if pd.notna(row.humidity_min)
                        else None
                    ),

                    max_humidity=(
                        float(row.humidity_max)
                        if pd.notna(row.humidity_max)
                        else None
                    ),

                    min_wind_speed=(
                        float(row.wind_speed_min)
                        if pd.notna(row.wind_speed_min)
                        else None
                    ),

                    max_wind_speed=(
                        float(row.wind_speed_max)
                        if pd.notna(row.wind_speed_max)
                        else None
                    ),
                )
            )

        # ============================================================
        # BULK INSERT
        # ============================================================

        total_records = len(records)
        batch_size = 5000

        self.stdout.write(
            "Importing records into PostgreSQL"
        )

        with transaction.atomic():

            for start in range(
                0,
                total_records,
                batch_size
            ):

                batch = records[
                    start:start + batch_size
                ]

                RainfallRecord.objects.bulk_create(
                    batch,
                    batch_size=batch_size
                )

                imported = min(
                    start + batch_size,
                    total_records
                )

                self.stdout.write(
                    f"Imported "
                    f"{imported:,} / "
                    f"{total_records:,}"
                )

        # ============================================================
        # VERIFY
        # ============================================================

        final_count = (
            RainfallRecord.objects.count()
        )

        self.stdout.write("")

        self.stdout.write(
            self.style.SUCCESS(
                "=========================================="
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "TELANGANA CLIMATE DATA IMPORT COMPLETED"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Records in database: {final_count:,}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Years: {years}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Rainfall: YES"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Temperature: YES"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Humidity: YES"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Wind Speed: YES"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "=========================================="
            )
        )
