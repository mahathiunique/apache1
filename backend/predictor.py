import joblib
import pandas as pd
from pathlib import Path

# =========================
# MODEL PATHS
# =========================

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"

_mortality_model = None
_los_model = None
_apache_model = None


def _load_models():
    global _mortality_model, _los_model, _apache_model

    if _mortality_model is None:
        _mortality_model = joblib.load(
            MODELS_DIR / "apache1_mortality_model.pkl"
        )

    if _los_model is None:
        _los_model = joblib.load(
            MODELS_DIR / "apache1_los_model.pkl"
        )

    if _apache_model is None:
        _apache_model = joblib.load(
            MODELS_DIR / "apache_score_model.pkl"
        )


# =========================
# FEATURE COLUMNS
# =========================

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


# =========================
# DATAFRAME BUILDER
# =========================

def _build_dataframe(data: dict) -> pd.DataFrame:
    row = {}

    for col in FEATURE_COLUMNS:
        row[col] = data.get(col, 0)

    return pd.DataFrame([row])


# =========================
# MORTALITY PREDICTION
# =========================

def predict_mortality(data: dict) -> dict:
    _load_models()

    df = _build_dataframe(data)

    probability = float(
        _mortality_model.predict_proba(df)[0][1]
    )

    mortality_percentage = round(
        probability * 100,
        2
    )

    if mortality_percentage >= 60:
        risk = "HIGH"
    elif mortality_percentage >= 30:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return {
        "mortality_probability": mortality_percentage,
        "risk_level": risk
    }


# =========================
# LOS PREDICTION
# =========================

def predict_los(data: dict) -> dict:
    _load_models()

    df = _build_dataframe(data)

    los_value = float(
        _los_model.predict(df)[0]
    )

    los_value = max(0, los_value)

    days = int(los_value)

    hours = round(
        (los_value - days) * 24
    )

    if hours == 24:
        days += 1
        hours = 0

    return {
        "los_prediction": round(los_value, 2),
        "los_days": days,
        "los_hours": hours
    }


# =========================
# APACHE SCORE PREDICTION
# =========================

def predict_apache_score(data: dict) -> dict:
    _load_models()

    df = _build_dataframe(data)

    apache_score = int(
        round(
            float(
                _apache_model.predict(df)[0]
            )
        )
    )

    apache_score = max(0, apache_score)

    return {
        "apache_score": apache_score
    }


# =========================
# HEALTH CHECK
# =========================

if __name__ == "__main__":
    try:
        _load_models()
        print("✅ All models loaded successfully")
    except Exception as e:
        print(f"❌ Error loading models: {e}")