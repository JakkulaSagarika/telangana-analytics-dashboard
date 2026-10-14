import os

import pandas as pd

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from rainfall.models import RainfallRecord


class Command(BaseCommand):

    help = "Import Telangana rainfall and climate data from CSV"

    def handle(self, *args, **options):

        # ============================================================
        # CSV FILE
        # ============================================================

        file_path = os.path.join(
            settings.BASE_DIR,
            "data",
            "combined_output.csv"
        )

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

        missing = [
            column
            for column in required_columns
            if column not in df.columns
        ]

        if missing:

            self.stdout.write(
                self.style.ERROR(
                    "Missing columns:"
                )
            )

            for column in missing:
                self.stdout.write(
                    f"  - {column}"
                )

            return

        # ============================================================
        # DATE
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

        invalid_dates = df["date"].isna().sum()

        if invalid_dates:

            self.stdout.write(
                self.style.WARNING(
                    f"Skipping {invalid_dates:,} rows with invalid dates."
                )
            )

            df = df.dropna(
                subset=["date"]
            )

        # ============================================================
        # TEXT COLUMNS
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

        # Remove rows without location
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

        df["rainfall"] = (
            df["rainfall"]
            .fillna(0)
        )

        # ============================================================
        # CONVERT NEGATIVE / INVALID VALUES TO NULL
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

            df.loc[
                df[column] < 0,
                column
            ] = None

        # ============================================================
        # HANDLE DUPLICATE DATE RECORDS
        # ============================================================

        duplicate_count = df.duplicated(
            subset=[
                "district",
                "mandal",
                "date"
            ],
            keep=False
        ).sum()

        if duplicate_count:

            self.stdout.write(
                self.style.WARNING(
                    f"Duplicate location/date rows found: "
                    f"{duplicate_count:,}"
                )
            )

            self.stdout.write(
                "Aggregating duplicate records..."
            )

            # Rainfall is summed.
            # Other measurements use mean.
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
        # DISPLAY YEARS
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
        # DELETE OLD DATABASE DATA
        # ============================================================

        existing_count = (
            RainfallRecord.objects.count()
        )

        if existing_count:

            self.stdout.write(
                self.style.WARNING(
                    f"Removing {existing_count:,} old records..."
                )
            )

            RainfallRecord.objects.all().delete()

        # ============================================================
        # CREATE DATABASE OBJECTS
        # ============================================================

        records = []

        total = len(df)

        self.stdout.write(
            "Preparing database records..."
        )

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

        self.stdout.write(
            "Importing records into SQLite..."
        )

        batch_size = 5000

        with transaction.atomic():

            for start in range(
                0,
                len(records),
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
                    total
                )

                self.stdout.write(
                    f"Imported "
                    f"{imported:,} / "
                    f"{total:,}"
                )

        # ============================================================
        # FINAL VERIFICATION
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
                "CLIMATE DATA IMPORT COMPLETED"
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
