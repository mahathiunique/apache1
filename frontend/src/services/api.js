import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

// --- Patient ---
export const getPatient = (id) => api.get(`/patient/${id}`).then((r) => r.data);
export const listPatients = (page = 1, limit = 20) =>
  api.get(`/patient/list`, { params: { page, limit } }).then((r) => r.data);

// --- Predictions ---
export const predictMortality = (features) =>
  api.post("/mortality/predict", features).then((r) => r.data);
export const predictLOS = (features) =>
  api.post("/los/predict", features).then((r) => r.data);
export const predictApache = (features) =>
  api.post("/apache/predict", features).then((r) => r.data);
export const runAllPredictions = async (features) => {
  const [mortality, los, apache] = await Promise.all([
    predictMortality(features),
    predictLOS(features),
    predictApache(features),
  ]);
  return { mortality, los, apache };
};

// --- Admissions ---
export const admitPatient = (data) =>
  api.post("/admissions/admit", data).then((r) => r.data);
export const listAdmissions = (page = 1, limit = 20) =>
  api.get("/admissions/list", { params: { page, limit } }).then((r) => r.data);

// --- Reports ---
export const getReportSummary = () =>
  api.get("/reports/summary").then((r) => r.data);
export const getDiagnosisDistribution = () =>
  api.get("/reports/diagnosis-distribution").then((r) => r.data);
export const getMortalityByDiagnosis = () =>
  api.get("/reports/mortality-by-diagnosis").then((r) => r.data);
export const getLOSDistribution = () =>
  api.get("/reports/los-distribution").then((r) => r.data);
export const getApacheDistribution = () =>
  api.get("/reports/apache-score-distribution").then((r) => r.data);
export const getGenderDistribution = () =>
  api.get("/reports/gender-distribution").then((r) => r.data);
export const getWardDistribution = () =>
  api.get("/reports/ward-distribution").then((r) => r.data);
export const getRecentAdmissions = (limit = 10) =>
  api.get("/reports/recent-admissions", { params: { limit } }).then((r) => r.data);

export default api;
