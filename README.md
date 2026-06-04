# APACHE-I ICU AI Decision Support System

## Project Structure

```
apache1/
├── backend/
│   ├── app.py              # FastAPI application entry point
│   ├── predictor.py        # Model loading & prediction logic
│   ├── requirements.txt    # Python dependencies
│   └── routes/
│       ├── __init__.py
│       ├── patient.py      # GET /patient/list, GET /patient/{id}
│       ├── mortality.py    # POST /mortality/predict
│       ├── los.py          # POST /los/predict
│       └── apache_score.py # POST /apache/predict
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── PatientCard.jsx
│       │   ├── MortalityCard.jsx
│       │   ├── LOSCard.jsx
│       │   ├── ApacheScoreCard.jsx
│       │   ├── PatientTable.jsx
│       │   └── EditPatientModal.jsx
│       ├── pages/
│       │   ├── PatientDashboard.jsx
│       │   └── ReceptionDashboard.jsx
│       └── services/
│           └── api.js
│
└── models/                 # Place your trained .pkl files here
    ├── apache1_mortality_model.pkl
    ├── apache1_los_model.pkl
    └── apache_score_model.pkl
```

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Make sure the `models/` directory is one level above `backend/` and contains:
- `apache1_mortality_model.pkl`
- `apache1_los_model.pkl`
- `apache_score_model.pkl`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at http://localhost:5173 by default.
Set `VITE_API_URL` environment variable to point to your backend if it's not on localhost:8000.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Health check |
| GET | /patient/list | Paginated patient list |
| GET | /patient/{id} | Get patient by UHID/IPNumber/ID |
| POST | /mortality/predict | Predict mortality risk |
| POST | /los/predict | Predict length of stay |
| POST | /apache/predict | Predict APACHE score |

## User Roles

- **Patient View** — Search patients, view AI predictions, vitals, and clinical insights
- **Reception/Admin** — Browse all patients, filter, edit records, re-run predictions
