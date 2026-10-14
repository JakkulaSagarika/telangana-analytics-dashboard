# Telangana Unified Portal — Education and EV integration

The landing page contains seven cards. The existing Education and EV cards use
the supplied local assets and now open the integrated dashboards at:

- `/education`
- `/ev`

The original Education/EV React pages are kept under
`frontend/src/education-ev/`. Their Django applications and API routes are
registered under `backend/education`, `backend/ev`, `/api/education/`, and
`/api/ev/`.

## Run locally

In separate terminals:

```powershell
cd backend
python manage.py runserver
```

```powershell
cd frontend
npm install
npm run dev
```

The bundled SQLite database has already been migrated and populated. To reload
the dashboard datasets, run `python manage.py import_education_data`,
`python manage.py import_dropout_data`, and `python manage.py import_ev_data`
from `backend`.
