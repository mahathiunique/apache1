from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np
from pathlib import Path
import random

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_PATH = BASE_DIR / "data" / "raw" / "apache1_dataset.csv"

_df_cache = None


def _load_data() -> pd.DataFrame:
    global _df_cache
    if _df_cache is None:
        _df_cache = pd.read_csv(DATA_PATH, low_memory=False)
        _df_cache = _df_cache.replace({np.nan: None})
    return _df_cache


def _safe_val(val):
    if val is None:
        return None
    if isinstance(val, float) and np.isnan(val):
        return None
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return float(val)
    return val


def _row_to_patient(row: pd.Series) -> dict:
    def age_to_dob(age):
        if age is None:
            return "Unknown"
        return f"~{2026 - int(age)}"

    gender = _safe_val(row.get("Gender")) or "Unknown"
    age = _safe_val(row.get("Age"))

    return {
        "patient_id": str(_safe_val(row.get("UHID")) or row.get("IPNumber") or f"PT-{random.randint(10000,99999)}"),
        "name": f"Patient {str(_safe_val(row.get('UHID')) or '')[:8]}",
        "age": age,
        "gender": gender,
        "diagnosis": _safe_val(row.get("SystemValue")) or "Unknown",
        "diagnosis_detail": _safe_val(row.get("DiagnosisValue")) or "Unknown",
        "ward": _safe_val(row.get("APACHE_WARD")) or _safe_val(row.get("Ward")) or "ICU",
        "location": _safe_val(row.get("LOCATION")) or "Unknown",
        "admission_date": str(_safe_val(row.get("AdmissionDate")) or "Unknown"),
        "status": _safe_val(row.get("CUSTOMERSTATUS")) or "Unknown",
        "vitals": {
            "heart_rate": _safe_val(row.get("HeartRate")),
            "temperature": _safe_val(row.get("Temperature")),
            "mean_arterial_pressure": _safe_val(row.get("MeanArterialPressure")),
            "respiratory_rate": _safe_val(row.get("RespiratoryRate")),
            "oxygen_saturation": _safe_val(row.get("pO2")),
            "sodium": _safe_val(row.get("Sodium")),
        },
        "features": {
            "Age": _safe_val(row.get("Age")),
            "Temperature": _safe_val(row.get("Temperature")),
            "MeanArterialPressure": _safe_val(row.get("MeanArterialPressure")),
            "HeartRate": _safe_val(row.get("HeartRate")),
            "RespiratoryRate": _safe_val(row.get("RespiratoryRate")),
            "FiO2": _safe_val(row.get("FiO2")),
            "pO2": _safe_val(row.get("pO2")),
            "pCO2": _safe_val(row.get("pCO2")),
            "ArterialpH": _safe_val(row.get("ArterialpH")),
            "Sodium": _safe_val(row.get("Sodium")),
            "UrineOutput": _safe_val(row.get("UrineOutput")),
            "Creatinine": _safe_val(row.get("Creatinine")),
            "Urea": _safe_val(row.get("Urea")),
            "BSL": _safe_val(row.get("BSL")),
            "Albumin": _safe_val(row.get("Albumin")),
            "Bilirubin": _safe_val(row.get("Bilirubin")),
            "Hematocrit": _safe_val(row.get("Hematocrit")),
            "WBC": _safe_val(row.get("WBC")),
            "IsGCSNotAvailable": _safe_val(row.get("IsGCSNotAvailable")),
            "GCSEyes": _safe_val(row.get("GCSEyes")),
            "GCSVerbal": _safe_val(row.get("GCSVerbal")),
            "GCSMotor": _safe_val(row.get("GCSMotor")),
            "MecanicalVentilation": _safe_val(row.get("MecanicalVentilation")),
            "CRF": _safe_val(row.get("CRF")),
            "Lymphoma": _safe_val(row.get("Lymphoma")),
            "Cirrhosis": _safe_val(row.get("Cirrhosis")),
            "Leukemia": _safe_val(row.get("Leukemia")),
            "HepaticFailure": _safe_val(row.get("HepaticFailure")),
            "Immunosuppression": _safe_val(row.get("Immunosuppression")),
            "MetastaticCarcinoma": _safe_val(row.get("MetastaticCarcinoma")),
            "AIDS": _safe_val(row.get("AIDS")),
            "PreICULengthOfStay": _safe_val(row.get("PreICULengthOfStay")),
            "DiagnosisType": _safe_val(row.get("DiagnosisType")),
            "Origin": _safe_val(row.get("Origin")),
            "EmergencySurgery": _safe_val(row.get("EmergencySurgery")),
            "Readmission": _safe_val(row.get("Readmission")),
            "Thrombolysis": _safe_val(row.get("Thrombolysis")),
            "RespiratoryQuotient": _safe_val(row.get("RespiratoryQuotient")),
            "AtmosphericPressure": _safe_val(row.get("AtmosphericPressure")),
            "SystemValue": _safe_val(row.get("SystemValue")),
            "DiagnosisValue": _safe_val(row.get("DiagnosisValue")),
            "Gender": _safe_val(row.get("Gender")),
        },
    }


@router.get("/list")
def list_patients(page: int = 1, limit: int = 20):
    df = _load_data()
    total = len(df)
    start = (page - 1) * limit
    end = start + limit
    subset = df.iloc[start:end]
    patients = [_row_to_patient(row) for _, row in subset.iterrows()]
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "patients": patients,
    }


@router.get("/{patient_id}")
def get_patient(patient_id: str):
    df = _load_data()

    # Try matching by UHID or IPNumber
    match = df[
        (df["UHID"].astype(str) == patient_id) |
        (df["IPNumber"].astype(str) == patient_id) |
        (df["ID"].astype(str) == patient_id)
    ]

    if match.empty:
        # Fallback: try numeric index
        try:
            idx = int(patient_id)
            if 0 <= idx < len(df):
                row = df.iloc[idx]
                return _row_to_patient(row)
        except ValueError:
            pass
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found")

    row = match.iloc[0]
    return _row_to_patient(row)
