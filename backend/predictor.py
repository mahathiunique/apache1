import os
import joblib
import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"

_mortality_model = None
_los_model = None
_apache_model = None


def _load_models():
    global _mortality_model, _los_model, _apache_model
    if _mortality_model is None:
        _mortality_model = joblib.load(MODELS_DIR / "apache1_mortality_model.pkl")
    if _los_model is None:
        _los_model = joblib.load(MODELS_DIR / "apache1_los_model.pkl")
    if _apache_model is None:
        _apache_model = joblib.load(MODELS_DIR / "apache_score_model.pkl")


FEATURE_COLUMNS = [
    "Age",
    "Temperature",
    "MeanArterialPressure",
    "HeartRate",
    "RespiratoryRate",
    "FiO2",
    "pO2",
    "pCO2",
    "ArterialpH",
    "Sodium",
    "UrineOutput",
    "Creatinine",
    "Urea",
    "BSL",
    "Albumin",
    "Bilirubin",
    "Hematocrit",
    "WBC",
    "IsGCSNotAvailable",
    "GCSEyes",
    "GCSVerbal",
    "GCSMotor",
    "MecanicalVentilation",
    "CRF",
    "Lymphoma",
    "Cirrhosis",
    "Leukemia",
    "HepaticFailure",
    "Immunosuppression",
    "MetastaticCarcinoma",
    "AIDS",
    "PreICULengthOfStay",
    "DiagnosisType",
    "Origin",
    "EmergencySurgery",
    "Readmission",
    "Thrombolysis",
    "RespiratoryQuotient",
    "AtmosphericPressure",
    "SystemValue",
    "DiagnosisValue",
    "Gender",
]


def _build_dataframe(data: dict) -> pd.DataFrame:
    row = {col: data.get(col) for col in FEATURE_COLUMNS}
    return pd.DataFrame([row])


def predict_mortality(data: dict) -> dict:
    _load_models()
    df = _build_dataframe(data)
    proba = _mortality_model.predict_proba(df)[0]
    mortality_prob = round(float(proba[1]) * 100, 1)
    if mortality_prob >= 60:
        risk = "HIGH"
    elif mortality_prob >= 30:
        risk = "MEDIUM"
    else:
        risk = "LOW"
    return {
        "mortality_probability": mortality_prob,
        "risk": risk,
    }


def predict_los(data: dict) -> dict:
    _load_models()
    df = _build_dataframe(data)
    los_raw = float(_los_model.predict(df)[0])
    los_days = max(0.0, los_raw)
    days = int(los_days)
    hours = round((los_days - days) * 24)
    if hours == 24:
        days += 1
        hours = 0
    return {
        "los_prediction": round(los_days, 2),
        "los_days": days,
        "los_hours": hours,
    }


def predict_apache_score(data: dict) -> dict:
    _load_models()
    df = _build_dataframe(data)
    score_raw = _apache_model.predict(df)[0]
    score = max(0, int(round(float(score_raw))))
    return {
        "apache_score": score,
    }
