
from django.apps import AppConfig
from django.db.models.signals import post_migrate


def seed_empty_database(sender, app_config, using, **kwargs):
    """Populate a freshly migrated database from the bundled workbook once."""
    if app_config.name != "records":
        return

    from records.management.commands.import_excel import import_excel_data
    from records.models import BirthCount, DeathCount, GramPanchayat, Municipality, MunicipalCorporation

    models = (BirthCount, DeathCount, GramPanchayat, Municipality, MunicipalCorporation)
    if not any(model.objects.using(using).exists() for model in models):
        import_excel_data(replace_existing=False)

class RecordsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'records'

    def ready(self):
        post_migrate.connect(seed_empty_database, sender=self, dispatch_uid="records.seed_empty_database")
