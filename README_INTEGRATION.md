# Telangana Unified Dashboard

This is one integrated application. The Rainfall Dashboard is served by the
Unified Dashboard at `/rainfall-dashboard` and its APIs are available under
`/api/rainfall/`.

## Run the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Run the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, then select the Telangana Rainfall Dashboard card.
Do not start a second Rainfall frontend or backend.

## Rainfall data

The supplied unified SQLite database includes the migrated rainfall data. If a
new empty database is deliberately created, restore the included source data
with:

```powershell
python manage.py import_csv
python manage.py warm_analytics_cache
```

`warm_analytics_cache` is intentionally manual so SQLite imports and migrations
do not compete with analytics cache generation.
