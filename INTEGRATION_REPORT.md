# Telangana Unified Dashboard integration

This is one application. The master frontend owns the routes and lazy-loads the
Agriculture and Literacy modules at `/agriculture` and `/literacy`.

## Run

```powershell
# Terminal 1
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Terminal 2
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Integrated modules

- `frontend/src/agriculture/` retains the Agriculture dashboard pages and map.
- `frontend/src/literacy/` retains the Literacy dashboard, map, styles, and
  supplied `frontend/public/literacy.csv` data.
- `backend/agriculture/` is a namespaced Django app, exposed at
  `/api/agriculture/`. Its supplied SQLite records are migrated into the
  unified `db.sqlite3` table `agriculture_agriculturedata`.
- `backend/literacy/` provides the shared district geometry at
  `/api/literacy/districts/`.

No separate Agriculture or Literacy frontend or backend is required.

## Verification performed

- `python manage.py check`
- Django requests to Agriculture summary and both district geometry endpoints
- `npm run build`
