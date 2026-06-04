from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from predictor import predict_apache_score

router = APIRouter()


class ApacheRequest(BaseModel):
    Age: Optional[float] = None
    Temperature: Optional[float] = None
    MeanArterialPressure: Optional[float] = None
    HeartRate: Optional[float] = None
    RespiratoryRate: Optional[float] = None
    FiO2: Optional[float] = None
    pO2: Optional[float] = None
    pCO2: Optional[float] = None
    ArterialpH: Optional[float] = None
    Sodium: Optional[float] = None
    UrineOutput: Optional[float] = None
    Creatinine: Optional[float] = None
    Urea: Optional[float] = None
    BSL: Optional[float] = None
    Albumin: Optional[float] = None
    Bilirubin: Optional[float] = None
    Hematocrit: Optional[float] = None
    WBC: Optional[float] = None
    IsGCSNotAvailable: Optional[int] = None
    GCSEyes: Optional[int] = None
    GCSVerbal: Optional[int] = None
    GCSMotor: Optional[int] = None
    MecanicalVentilation: Optional[str] = None
    CRF: Optional[int] = None
    Lymphoma: Optional[int] = None
    Cirrhosis: Optional[int] = None
    Leukemia: Optional[int] = None
    HepaticFailure: Optional[int] = None
    Immunosuppression: Optional[int] = None
    MetastaticCarcinoma: Optional[int] = None
    AIDS: Optional[int] = None
    PreICULengthOfStay: Optional[float] = None
    DiagnosisType: Optional[int] = None
    Origin: Optional[int] = None
    EmergencySurgery: Optional[int] = None
    Readmission: Optional[int] = None
    Thrombolysis: Optional[int] = None
    RespiratoryQuotient: Optional[float] = None
    AtmosphericPressure: Optional[float] = None
    SystemValue: Optional[str] = None
    DiagnosisValue: Optional[str] = None
    Gender: Optional[str] = None


@router.post("/predict")
def apache_predict(payload: ApacheRequest):
    try:
        result = predict_apache_score(payload.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
