from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import numpy as np
from pathlib import Path
from predictor import predict_mortality, predict_los, predict_apache_score
import random
import json
from datetime import datetime

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_PATH = BASE_DIR / "data" / "raw" / "apache1_dataset.csv"
ADMISSIONS_PATH = BASE_DIR / "data" / "admissions.json"


def _load_admissions() -> list:
    if ADMISSIONS_PATH.exists():
        with open(ADMISSIONS_PATH, "r") as f:
            return json.load(f)
    return []


def _save_admissions(records: list):
    ADMISSIONS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(ADMISSIONS_PATH, "w") as f:
        json.dump(records, f, indent=2)


class AdmissionRequest(BaseModel):
    # Demographics
    name: Optional[str] = None
    age: Optional[float] = None
    gender: Optional[str] = None
    ward: Optional[str] = None
    location: Optional[str] = None
    diagnosis: Optional[str] = None
    diagnosis_detail: Optional[str] = None
    emergency_surgery: Optional[int] = 0
    readmission: Optional[int] = 0

    # Vitals
    temperature: Optional[float] = None
    heart_rate: Optional[float] = None
    mean_arterial_pressure: Optional[float] = None
    respiratory_rate: Optional[float] = None
    fi_o2: Optional[float] = None
    p_o2: Optional[float] = None
    p_co2: Optional[float] = None
    arterial_ph: Optional[float] = None
    sodium: Optional[float] = None
    urine_output: Optional[float] = None
    creatinine: Optional[float] = None
    urea: Optional[float] = None
    bsl: Optional[float] = None
    albumin: Optional[float] = None
    bilirubin: Optional[float] = None
    hematocrit: Optional[float] = None
    wbc: Optional[float] = None

    # GCS
    is_gcs_not_available: Optional[int] = 0
    gcs_eyes: Optional[int] = 4
    gcs_verbal: Optional[int] = 5
    gcs_motor: Optional[int] = 6

    # Comorbidities
    mechanical_ventilation: Optional[str] = "0"
    crf: Optional[int] = 0
    lymphoma: Optional[int] = 0
    cirrhosis: Optional[int] = 0
    leukemia: Optional[int] = 0
    hepatic_failure: Optional[int] = 0
    immunosuppression: Optional[int] = 0
    metastatic_carcinoma: Optional[int] = 0
    aids: Optional[int] = 0
    thrombolysis: Optional[int] = 0

    # Other
    pre_icu_los: Optional[float] = 0
    diagnosis_type: Optional[int] = 1
    origin: Optional[int] = 1
    respiratory_quotient: Optional[float] = None
    atmospheric_pressure: Optional[float] = 760.0
    system_value: Optional[str] = None
    diagnosis_value: Optional[str] = None


@router.post("/admit")
def admit_patient(payload: AdmissionRequest):
    patient_id = f"NEW.{random.randint(1000000, 9999999)}"
    admitted_at = datetime.now().strftime("%Y-%m-%d %H:%M")

    features = {
        "Age": payload.age,
        "Temperature": payload.temperature,
        "MeanArterialPressure": payload.mean_arterial_pressure,
        "HeartRate": payload.heart_rate,
        "RespiratoryRate": payload.respiratory_rate,
        "FiO2": payload.fi_o2,
        "pO2": payload.p_o2,
        "pCO2": payload.p_co2,
        "ArterialpH": payload.arterial_ph,
        "Sodium": payload.sodium,
        "UrineOutput": payload.urine_output,
        "Creatinine": payload.creatinine,
        "Urea": payload.urea,
        "BSL": payload.bsl,
        "Albumin": payload.albumin,
        "Bilirubin": payload.bilirubin,
        "Hematocrit": payload.hematocrit,
        "WBC": payload.wbc,
        "IsGCSNotAvailable": payload.is_gcs_not_available,
        "GCSEyes": payload.gcs_eyes,
        "GCSVerbal": payload.gcs_verbal,
        "GCSMotor": payload.gcs_motor,
        "MecanicalVentilation": payload.mechanical_ventilation,
        "CRF": payload.crf,
        "Lymphoma": payload.lymphoma,
        "Cirrhosis": payload.cirrhosis,
        "Leukemia": payload.leukemia,
        "HepaticFailure": payload.hepatic_failure,
        "Immunosuppression": payload.immunosuppression,
        "MetastaticCarcinoma": payload.metastatic_carcinoma,
        "AIDS": payload.aids,
        "PreICULengthOfStay": payload.pre_icu_los,
        "DiagnosisType": payload.diagnosis_type,
        "Origin": payload.origin,
        "EmergencySurgery": payload.emergency_surgery,
        "Readmission": payload.readmission,
        "Thrombolysis": payload.thrombolysis,
        "RespiratoryQuotient": payload.respiratory_quotient,
        "AtmosphericPressure": payload.atmospheric_pressure,
        "SystemValue": payload.system_value or payload.diagnosis,
        "DiagnosisValue": payload.diagnosis_value or payload.diagnosis_detail,
        "Gender": payload.gender,
    }

    try:
        mortality = predict_mortality(features)
        los = predict_los(features)
        apache = predict_apache_score(features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

    record = {
        "patient_id": patient_id,
        "name": payload.name or f"Patient {patient_id[:8]}",
        "age": payload.age,
        "gender": payload.gender,
        "ward": payload.ward or "ICU",
        "location": payload.location,
        "diagnosis": payload.diagnosis,
        "diagnosis_detail": payload.diagnosis_detail,
        "admission_date": admitted_at,
        "status": "ALIVE",
        "vitals": {
            "heart_rate": payload.heart_rate,
            "temperature": payload.temperature,
            "mean_arterial_pressure": payload.mean_arterial_pressure,
            "respiratory_rate": payload.respiratory_rate,
            "oxygen_saturation": payload.p_o2,
            "sodium": payload.sodium,
        },
        "predictions": {
            "mortality": mortality,
            "los": los,
            "apache": apache,
        },
        "features": features,
    }

    admissions = _load_admissions()
    admissions.insert(0, record)
    _save_admissions(admissions)

    return {
        "success": True,
        "patient_id": patient_id,
        "patient": record,
        "predictions": {
            "mortality": mortality,
            "los": los,
            "apache": apache,
        },
    }


@router.get("/list")
def list_admissions(page: int = 1, limit: int = 20):
    admissions = _load_admissions()
    total = len(admissions)
    start = (page - 1) * limit
    end = start + limit
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "admissions": admissions[start:end],
    }


@router.get("/{patient_id}")
def get_admission(patient_id: str):
    admissions = _load_admissions()
    for a in admissions:
        if a["patient_id"] == patient_id:
            return a
    raise HTTPException(status_code=404, detail="Admission not found")
