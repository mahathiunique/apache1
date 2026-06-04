from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np
from pathlib import Path
import json
from collections import Counter

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_PATH = BASE_DIR / "data" / "raw" / "apache1_dataset.csv"
ADMISSIONS_PATH = BASE_DIR / "data" / "admissions.json"

_df_cache = None


def _load_data() -> pd.DataFrame:
    global _df_cache
    if _df_cache is None:
        _df_cache = pd.read_csv(DATA_PATH, low_memory=False)
        _df_cache = _df_cache.replace({np.nan: None})
    return _df_cache


def _load_admissions() -> list:
    if ADMISSIONS_PATH.exists():
        with open(ADMISSIONS_PATH, "r") as f:
            return json.load(f)
    return []


def _safe(val):
    if val is None:
        return None
    if isinstance(val, float) and np.isnan(val):
        return None
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return float(val)
    return val


@router.get("/summary")
def get_summary():
    """Overall dataset statistics."""
    df = _load_data()
    admissions = _load_admissions()

    total = len(df)
    alive = int((df["CUSTOMERSTATUS"] == "ALIVE").sum()) if "CUSTOMERSTATUS" in df.columns else 0
    dead = int((df["CUSTOMERSTATUS"] == "DEAD").sum()) if "CUSTOMERSTATUS" in df.columns else 0
    mortality_rate = round(dead / total * 100, 1) if total > 0 else 0

    # LOS stats
    los_col = None
    for col in ["LOS", "LengthOfStay", "los", "length_of_stay"]:
        if col in df.columns:
            los_col = col
            break

    avg_los = None
    median_los = None
    if los_col:
        los_vals = df[los_col].dropna()
        avg_los = round(float(los_vals.mean()), 2) if len(los_vals) > 0 else None
        median_los = round(float(los_vals.median()), 2) if len(los_vals) > 0 else None

    # Apache score stats
    apache_col = None
    for col in ["APACHE_Score", "ApacheScore", "apache_score"]:
        if col in df.columns:
            apache_col = col
            break
    avg_apache = None
    if apache_col:
        apache_vals = df[apache_col].dropna()
        avg_apache = round(float(apache_vals.mean()), 1) if len(apache_vals) > 0 else None

    return {
        "total_patients": total,
        "alive": alive,
        "dead": dead,
        "mortality_rate": mortality_rate,
        "avg_los_days": avg_los,
        "median_los_days": median_los,
        "avg_apache_score": avg_apache,
        "new_admissions": len(admissions),
    }


@router.get("/diagnosis-distribution")
def get_diagnosis_distribution():
    """Breakdown by diagnosis/system."""
    df = _load_data()
    col = "SystemValue" if "SystemValue" in df.columns else None
    if col is None:
        return {"data": []}
    counts = df[col].dropna().value_counts().head(10)
    return {
        "data": [
            {"label": str(k), "count": int(v)}
            for k, v in counts.items()
        ]
    }


@router.get("/mortality-by-diagnosis")
def get_mortality_by_diagnosis():
    """Mortality rate per diagnosis category."""
    df = _load_data()
    if "SystemValue" not in df.columns or "CUSTOMERSTATUS" not in df.columns:
        return {"data": []}

    result = []
    for diag, grp in df.groupby("SystemValue"):
        if pd.isna(diag):
            continue
        total = len(grp)
        if total < 10:
            continue
        dead = int((grp["CUSTOMERSTATUS"] == "DEAD").sum())
        rate = round(dead / total * 100, 1)
        result.append({"diagnosis": str(diag), "mortality_rate": rate, "count": total})

    result.sort(key=lambda x: x["mortality_rate"], reverse=True)
    return {"data": result[:10]}


@router.get("/los-distribution")
def get_los_distribution():
    """LOS bucketed into ranges."""
    df = _load_data()
    los_col = None
    for col in ["LOS", "LengthOfStay", "los"]:
        if col in df.columns:
            los_col = col
            break
    if not los_col:
        return {"data": []}

    los = df[los_col].dropna()
    bins = [0, 1, 3, 7, 14, 30, float("inf")]
    labels = ["<1 day", "1–3 days", "3–7 days", "7–14 days", "14–30 days", "30+ days"]
    counts = pd.cut(los, bins=bins, labels=labels).value_counts().sort_index()
    return {
        "data": [
            {"range": str(label), "count": int(count)}
            for label, count in counts.items()
        ]
    }


@router.get("/apache-score-distribution")
def get_apache_score_distribution():
    """APACHE score severity band breakdown."""
    df = _load_data()
    apache_col = None
    for col in ["APACHE_Score", "ApacheScore", "apache_score"]:
        if col in df.columns:
            apache_col = col
            break
    if not apache_col:
        return {"data": []}

    scores = df[apache_col].dropna()
    bands = {
        "0–14 Low": int(((scores >= 0) & (scores < 15)).sum()),
        "15–24 Moderate": int(((scores >= 15) & (scores < 25)).sum()),
        "25–34 High": int(((scores >= 25) & (scores < 35)).sum()),
        "35+ Critical": int((scores >= 35).sum()),
    }
    return {
        "data": [{"band": k, "count": v} for k, v in bands.items()]
    }


@router.get("/gender-distribution")
def get_gender_distribution():
    df = _load_data()
    if "Gender" not in df.columns:
        return {"data": []}
    counts = df["Gender"].dropna().value_counts()
    return {
        "data": [{"gender": str(k), "count": int(v)} for k, v in counts.items()]
    }


@router.get("/ward-distribution")
def get_ward_distribution():
    df = _load_data()
    col = None
    for c in ["APACHE_WARD", "Ward", "ward"]:
        if c in df.columns:
            col = c
            break
    if not col:
        return {"data": []}
    counts = df[col].dropna().value_counts().head(8)
    return {
        "data": [{"ward": str(k), "count": int(v)} for k, v in counts.items()]
    }


@router.get("/recent-admissions")
def get_recent_admissions(limit: int = 10):
    """Latest manually admitted patients with predictions."""
    admissions = _load_admissions()
    return {"data": admissions[:limit]}
