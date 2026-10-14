from openpyxl import load_workbook


def load_health_excel(path):
    """
    Load the Excel workbook using openpyxl.
    Returns the workbook object.
    """

    workbook = load_workbook(
        filename=path,
        data_only=True
    )

    return workbook