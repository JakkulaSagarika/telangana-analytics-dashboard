import pandas as pd

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from literacy.models import LiteracyData


class Command(BaseCommand):
    help = "Import Telangana district literacy data from CSV"

    def handle(self, *args, **options):

        file_path = (
            settings.BASE_DIR.parent
            / "Dataa"
            / "Dataa"
            / "literacy.csv"
        )

        if not file_path.exists():
            raise CommandError(
                f"Literacy CSV file not found: {file_path}"
            )

        self.stdout.write(
            f"Reading literacy data from: {file_path}"
        )

        df = pd.read_csv(file_path)

        required_columns = [
            "Districts",
            "Males",
            "Females",
            "Literacy Rate Males",
            "Literacy Rate Females",
        ]

        missing_columns = [
            column
            for column in required_columns
            if column not in df.columns
        ]

        if missing_columns:
            raise CommandError(
                f"Missing columns: {missing_columns}"
            )

        imported = 0

        for _, row in df.iterrows():

            district = str(row["Districts"]).strip()

            if not district:
                continue

            LiteracyData.objects.update_or_create(
                district=district.title(),
                defaults={
                    "males": int(row["Males"]),
                    "females": int(row["Females"]),
                    "literacy_rate_males": float(
                        row["Literacy Rate Males"]
                    ),
                    "literacy_rate_females": float(
                        row["Literacy Rate Females"]
                    ),
                },
            )

            imported += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Imported/updated {imported} literacy records."
            )
        )