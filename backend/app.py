from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.patient import router as patient_router
from routes.mortality import router as mortality_router
from routes.los import router as los_router
from routes.apache_score import router as apache_router
from routes.admissions import router as admissions_router
from routes.reports import router as reports_router

app = FastAPI(
    title="APACHE-I ICU AI Decision Support System",
    description="AI-powered ICU dashboard for predicting Mortality Risk, Length of Stay, and APACHE Score",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patient_router, prefix="/patient", tags=["Patient"])
app.include_router(mortality_router, prefix="/mortality", tags=["Mortality"])
app.include_router(los_router, prefix="/los", tags=["Length of Stay"])
app.include_router(apache_router, prefix="/apache", tags=["APACHE Score"])
app.include_router(admissions_router, prefix="/admissions", tags=["Admissions"])
app.include_router(reports_router, prefix="/reports", tags=["Reports"])


@app.get("/", tags=["Health"])
def root():
    return {
        "system": "APACHE-I ICU AI Decision Support System",
        "status": "operational",
        "version": "1.0.0",
        "endpoints": {
            "patient": "/patient/{id}",
            "mortality": "/mortality/predict",
            "los": "/los/predict",
            "apache": "/apache/predict",
            "admissions": "/admissions/admit",
            "reports": "/reports/summary",
        },
    }
