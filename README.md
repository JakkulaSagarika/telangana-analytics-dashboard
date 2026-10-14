# Telangana Unified Analytics Portal

This project combines the supplied Telangana landing page, Health Peripheral
Dashboard, and Birth & Death Dashboard into one Django backend and one React
application.

## Run locally

1. In `backend`, install `requirements.txt`, then run `python manage.py runserver`.
2. In `frontend`, run `npm install`, then `npm run dev`.
3. Open `http://localhost:5173`. The unchanged landing page is the root route.

The Vite development proxy forwards `/api` to the single Django server at port
8000. For a separately hosted frontend, set `VITE_API_BASE_URL` and
`VITE_BIRTHDEATH_API_BASE_URL` to the corresponding Django API paths.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Original Telangana Analytics Portal landing page |
| `/health-dashboard` | Health Peripheral Dashboard |
| `/birth-death` | Birth & Death Dashboard |
| `/birth-death/births`, `/deaths`, `/districts`, `/gram-panchayats`, `/municipalities`, `/corporations` | Birth & Death sections |

## Backend integration

- `config` is the only active Django project configuration.
- `portal`, `health`, and `birthdeath` are registered local applications.
- The Birth & Death app retains Django's historical `records` label internally.
  This is intentional: it keeps the supplied SQLite database's `records_*`
  tables and migration history without a destructive migration.
- APIs are exposed at `/api/health/` and `/api/birthdeath/`. The original
  `/api/` and `/birthdeath-api/` addresses remain as compatibility aliases.
- The supplied `health_dashboard` and `records` folders remain in the source
  for traceability, but are not part of the active configuration.

## Preserved assets and data

The bundled `db.sqlite3`, health workbook, birth/death workbook, public map
assets, charts, maps, and dashboard components are retained. No iframes or
secondary React/Django applications are used.
