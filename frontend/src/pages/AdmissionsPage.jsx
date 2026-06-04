import { useState } from "react";
import { admitPatient } from "../services/api.js";
import MortalityCard from "../components/MortalityCard.jsx";
import LOSCard from "../components/LOSCard.jsx";
import ApacheScoreCard from "../components/ApacheScoreCard.jsx";

const DIAGNOSIS_OPTIONS = [
  "Respiratory", "Cardiovascular", "Neurologic", "Digestive",
  "Sepsis", "Renal", "Metabolic", "Trauma", "Oncologic", "Miscellaneous",
];

const WARD_OPTIONS = [
  "NEURO ICU", "CARDIAC ICU", "MEDICAL ICU", "SURGICAL ICU",
  "RESPIRATORY ICU", "GENERAL ICU", "HDU",
];

function Field({ label, required, children, hint }) {
  return (
    <div className="form-field">
      <label className="form-label">
        {label}{required && <span className="form-required">*</span>}
      </label>
      {children}
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="form-section">
      <div className="form-section-header">
        {icon}
        <span>{title}</span>
      </div>
      <div className="form-section-body">{children}</div>
    </div>
  );
}

export default function AdmissionsPage() {
  const [step, setStep] = useState(1); // 1 = form, 2 = result
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    name: "", age: "", gender: "Male", ward: "MEDICAL ICU",
    location: "", diagnosis: "Respiratory", diagnosis_detail: "",
    emergency_surgery: 0, readmission: 0,
    temperature: "", heart_rate: "", mean_arterial_pressure: "",
    respiratory_rate: "", fi_o2: "", p_o2: "", p_co2: "",
    arterial_ph: "", sodium: "", urine_output: "", creatinine: "",
    urea: "", bsl: "", albumin: "", bilirubin: "", hematocrit: "", wbc: "",
    is_gcs_not_available: 0, gcs_eyes: 4, gcs_verbal: 5, gcs_motor: 6,
    mechanical_ventilation: "0",
    crf: 0, lymphoma: 0, cirrhosis: 0, leukemia: 0,
    hepatic_failure: 0, immunosuppression: 0, metastatic_carcinoma: 0,
    aids: 0, thrombolysis: 0,
    pre_icu_los: 0, atmospheric_pressure: 760,
  });

  const set = (key) => (e) => {
    const val = e.target.type === "checkbox"
      ? (e.target.checked ? 1 : 0)
      : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const numericFields = [
    "age", "temperature", "heart_rate", "mean_arterial_pressure",
    "respiratory_rate", "fi_o2", "p_o2", "p_co2", "arterial_ph",
    "sodium", "urine_output", "creatinine", "urea", "bsl", "albumin",
    "bilirubin", "hematocrit", "wbc", "pre_icu_los", "atmospheric_pressure",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = { ...form };
    numericFields.forEach((k) => {
      if (payload[k] !== "" && payload[k] !== null && payload[k] !== undefined) {
        payload[k] = parseFloat(payload[k]);
      } else {
        payload[k] = null;
      }
    });
    ["gcs_eyes", "gcs_verbal", "gcs_motor"].forEach((k) => {
      payload[k] = parseInt(payload[k]);
    });

    try {
      const res = await admitPatient(payload);
      setResult(res);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewAdmission = () => {
    setStep(1);
    setResult(null);
    setError(null);
    setForm({
      name: "", age: "", gender: "Male", ward: "MEDICAL ICU",
      location: "", diagnosis: "Respiratory", diagnosis_detail: "",
      emergency_surgery: 0, readmission: 0,
      temperature: "", heart_rate: "", mean_arterial_pressure: "",
      respiratory_rate: "", fi_o2: "", p_o2: "", p_co2: "",
      arterial_ph: "", sodium: "", urine_output: "", creatinine: "",
      urea: "", bsl: "", albumin: "", bilirubin: "", hematocrit: "", wbc: "",
      is_gcs_not_available: 0, gcs_eyes: 4, gcs_verbal: 5, gcs_motor: 6,
      mechanical_ventilation: "0",
      crf: 0, lymphoma: 0, cirrhosis: 0, leukemia: 0,
      hepatic_failure: 0, immunosuppression: 0, metastatic_carcinoma: 0,
      aids: 0, thrombolysis: 0,
      pre_icu_los: 0, atmospheric_pressure: 760,
    });
  };

  if (step === 2 && result) {
    const { patient, predictions } = result;
    const mort = predictions?.mortality;
    const riskColor = mort?.risk === "HIGH" ? "#ef4444" : mort?.risk === "MEDIUM" ? "#f97316" : "#22c55e";

    return (
      <div className="admissions-result">
        <div className="admission-success-header">
          <div className="admission-success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <h2 className="admission-success-title">Patient Admitted Successfully</h2>
            <p className="admission-success-sub">
              ID: <strong>{result.patient_id}</strong> · {patient.admission_date}
            </p>
          </div>
          <button className="btn-primary" onClick={handleNewAdmission} style={{ marginLeft: "auto" }}>
            + New Admission
          </button>
        </div>

        <div className="admission-result-profile card">
          <div className="patient-profile-row">
            <div className="patient-avatar-lg">
              {(patient.name || "P").slice(0, 2).toUpperCase()}
            </div>
            <div className="patient-profile-info">
              <div className="patient-profile-name">{patient.name}</div>
              <div className="patient-profile-id">{result.patient_id}</div>
              <div className="patient-profile-meta">
                <span>{patient.age} yrs</span>
                <span>·</span>
                <span>{patient.gender}</span>
                <span>·</span>
                <span>{patient.diagnosis}</span>
                <span>·</span>
                <span>{patient.ward}</span>
              </div>
            </div>
            <div className="mortality-badge-lg" style={{ background: riskColor + "22", color: riskColor, border: `1px solid ${riskColor}44` }}>
              {mort?.risk} RISK · {mort?.mortality_probability}%
            </div>
          </div>
        </div>

        <div className="pred-result-cards">
          <MortalityCard data={predictions.mortality} loading={false} />
          <LOSCard data={predictions.los} loading={false} />
          <ApacheScoreCard data={predictions.apache} loading={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="admissions-page">
      <div className="admissions-header">
        <h2 className="admissions-title">New Patient Admission</h2>
        <p className="admissions-sub">
          Complete the form below. Predictions are auto-generated upon submission.
        </p>
      </div>

      {error && (
        <div className="error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Section title="Patient Demographics" icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        }>
          <div className="form-grid-3">
            <Field label="Full Name" required>
              <input className="form-input" value={form.name} onChange={set("name")} placeholder="e.g. Patient AHLG.000" required />
            </Field>
            <Field label="Age (years)" required>
              <input className="form-input" type="number" min="0" max="120" value={form.age} onChange={set("age")} placeholder="75" required />
            </Field>
            <Field label="Gender">
              <select className="form-input" value={form.gender} onChange={set("gender")}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Ward">
              <select className="form-input" value={form.ward} onChange={set("ward")}>
                {WARD_OPTIONS.map((w) => <option key={w}>{w}</option>)}
              </select>
            </Field>
            <Field label="Hospital / Location">
              <input className="form-input" value={form.location} onChange={set("location")} placeholder="e.g. Assam Hospitals Ltd" />
            </Field>
            <Field label="Diagnosis Category">
              <select className="form-input" value={form.diagnosis} onChange={set("diagnosis")}>
                {DIAGNOSIS_OPTIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Diagnosis Detail">
              <input className="form-input" value={form.diagnosis_detail} onChange={set("diagnosis_detail")} placeholder="e.g. Community-acquired pneumonia" />
            </Field>
            <Field label="Pre-ICU LOS (days)">
              <input className="form-input" type="number" min="0" step="0.1" value={form.pre_icu_los} onChange={set("pre_icu_los")} placeholder="0" />
            </Field>
          </div>
          <div className="form-checkboxes">
            <label className="form-checkbox-label">
              <input type="checkbox" checked={!!form.emergency_surgery} onChange={set("emergency_surgery")} />
              Emergency Surgery
            </label>
            <label className="form-checkbox-label">
              <input type="checkbox" checked={!!form.readmission} onChange={set("readmission")} />
              Readmission
            </label>
          </div>
        </Section>

        <Section title="Vital Signs & Labs" icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        }>
          <div className="form-grid-4">
            <Field label="Heart Rate" hint="bpm">
              <input className="form-input" type="number" step="0.1" value={form.heart_rate} onChange={set("heart_rate")} placeholder="104" />
            </Field>
            <Field label="Temperature" hint="°C">
              <input className="form-input" type="number" step="0.1" value={form.temperature} onChange={set("temperature")} placeholder="36.7" />
            </Field>
            <Field label="MAP" hint="mmHg">
              <input className="form-input" type="number" step="0.1" value={form.mean_arterial_pressure} onChange={set("mean_arterial_pressure")} placeholder="73.26" />
            </Field>
            <Field label="Respiratory Rate" hint="/min">
              <input className="form-input" type="number" step="0.1" value={form.respiratory_rate} onChange={set("respiratory_rate")} placeholder="20" />
            </Field>
            <Field label="FiO2" hint="fraction">
              <input className="form-input" type="number" step="0.01" min="0.21" max="1" value={form.fi_o2} onChange={set("fi_o2")} placeholder="0.21" />
            </Field>
            <Field label="pO2" hint="mmHg">
              <input className="form-input" type="number" step="0.1" value={form.p_o2} onChange={set("p_o2")} placeholder="141" />
            </Field>
            <Field label="pCO2" hint="mmHg">
              <input className="form-input" type="number" step="0.1" value={form.p_co2} onChange={set("p_co2")} placeholder="40" />
            </Field>
            <Field label="Arterial pH">
              <input className="form-input" type="number" step="0.01" value={form.arterial_ph} onChange={set("arterial_ph")} placeholder="7.40" />
            </Field>
            <Field label="Sodium" hint="mEq/L">
              <input className="form-input" type="number" step="0.1" value={form.sodium} onChange={set("sodium")} placeholder="138" />
            </Field>
            <Field label="Urine Output" hint="mL/24h">
              <input className="form-input" type="number" step="1" value={form.urine_output} onChange={set("urine_output")} placeholder="1500" />
            </Field>
            <Field label="Creatinine" hint="mg/dL">
              <input className="form-input" type="number" step="0.01" value={form.creatinine} onChange={set("creatinine")} placeholder="1.0" />
            </Field>
            <Field label="Urea" hint="mg/dL">
              <input className="form-input" type="number" step="0.1" value={form.urea} onChange={set("urea")} placeholder="20" />
            </Field>
            <Field label="BSL" hint="mg/dL">
              <input className="form-input" type="number" step="0.1" value={form.bsl} onChange={set("bsl")} placeholder="110" />
            </Field>
            <Field label="Albumin" hint="g/dL">
              <input className="form-input" type="number" step="0.1" value={form.albumin} onChange={set("albumin")} placeholder="3.5" />
            </Field>
            <Field label="Bilirubin" hint="mg/dL">
              <input className="form-input" type="number" step="0.01" value={form.bilirubin} onChange={set("bilirubin")} placeholder="0.8" />
            </Field>
            <Field label="Hematocrit" hint="%">
              <input className="form-input" type="number" step="0.1" value={form.hematocrit} onChange={set("hematocrit")} placeholder="38" />
            </Field>
            <Field label="WBC" hint="×10³/µL">
              <input className="form-input" type="number" step="0.1" value={form.wbc} onChange={set("wbc")} placeholder="8.5" />
            </Field>
            <Field label="Atmospheric Pressure" hint="mmHg">
              <input className="form-input" type="number" step="1" value={form.atmospheric_pressure} onChange={set("atmospheric_pressure")} placeholder="760" />
            </Field>
          </div>
        </Section>

        <Section title="Glasgow Coma Scale (GCS)" icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
        }>
          <div className="form-grid-4">
            <Field label="GCS Eyes" hint="1–4">
              <select className="form-input" value={form.gcs_eyes} onChange={set("gcs_eyes")}>
                {[1,2,3,4].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="GCS Verbal" hint="1–5">
              <select className="form-input" value={form.gcs_verbal} onChange={set("gcs_verbal")}>
                {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="GCS Motor" hint="1–6">
              <select className="form-input" value={form.gcs_motor} onChange={set("gcs_motor")}>
                {[1,2,3,4,5,6].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Mechanical Ventilation">
              <select className="form-input" value={form.mechanical_ventilation} onChange={set("mechanical_ventilation")}>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </Field>
          </div>
          <div className="form-checkboxes">
            <label className="form-checkbox-label">
              <input type="checkbox" checked={!!form.is_gcs_not_available} onChange={set("is_gcs_not_available")} />
              GCS Not Available
            </label>
          </div>
        </Section>

        <Section title="Comorbidities" icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        }>
          <div className="form-checkboxes form-checkboxes-grid">
            {[
              ["crf", "Chronic Renal Failure"],
              ["lymphoma", "Lymphoma"],
              ["cirrhosis", "Cirrhosis"],
              ["leukemia", "Leukemia"],
              ["hepatic_failure", "Hepatic Failure"],
              ["immunosuppression", "Immunosuppression"],
              ["metastatic_carcinoma", "Metastatic Carcinoma"],
              ["aids", "AIDS"],
              ["thrombolysis", "Thrombolysis"],
            ].map(([key, label]) => (
              <label key={key} className="form-checkbox-label">
                <input type="checkbox" checked={!!form[key]} onChange={set(key)} />
                {label}
              </label>
            ))}
          </div>
        </Section>

        <div className="form-submit-row">
          <button type="submit" className="btn-admit" disabled={submitting}>
            {submitting ? (
              <>
                <div className="spinner-sm" />
                Running Predictions…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
                Admit Patient & Run Predictions
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
