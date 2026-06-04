import { useState, useEffect } from "react";

export default function EditPatientModal({ patient, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    heart_rate: "",
    temperature: "",
    mean_arterial_pressure: "",
    oxygen_saturation: "",
    respiratory_rate: "",
  });

  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name || "",
        age: patient.age ?? "",
        gender: patient.gender || "Male",
        heart_rate: patient.vitals?.heart_rate ?? "",
        temperature: patient.vitals?.temperature ?? "",
        mean_arterial_pressure: patient.vitals?.mean_arterial_pressure ?? "",
        oxygen_saturation: patient.vitals?.oxygen_saturation ?? "",
        respiratory_rate: patient.vitals?.respiratory_rate ?? "",
      });
    }
  }, [patient]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const updated = {
      ...patient,
      name: form.name,
      age: form.age !== "" ? Number(form.age) : null,
      gender: form.gender,
      vitals: {
        ...patient.vitals,
        heart_rate: form.heart_rate !== "" ? Number(form.heart_rate) : null,
        temperature: form.temperature !== "" ? Number(form.temperature) : null,
        mean_arterial_pressure: form.mean_arterial_pressure !== "" ? Number(form.mean_arterial_pressure) : null,
        oxygen_saturation: form.oxygen_saturation !== "" ? Number(form.oxygen_saturation) : null,
        respiratory_rate: form.respiratory_rate !== "" ? Number(form.respiratory_rate) : null,
      },
      features: {
        ...patient.features,
        Age: form.age !== "" ? Number(form.age) : patient.features?.Age,
        Gender: form.gender,
        HeartRate: form.heart_rate !== "" ? Number(form.heart_rate) : patient.features?.HeartRate,
        Temperature: form.temperature !== "" ? Number(form.temperature) : patient.features?.Temperature,
        MeanArterialPressure: form.mean_arterial_pressure !== "" ? Number(form.mean_arterial_pressure) : patient.features?.MeanArterialPressure,
        pO2: form.oxygen_saturation !== "" ? Number(form.oxygen_saturation) : patient.features?.pO2,
        RespiratoryRate: form.respiratory_rate !== "" ? Number(form.respiratory_rate) : patient.features?.RespiratoryRate,
      },
    };
    onSave(updated);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Edit Patient Record</div>
            <div className="modal-subtitle">{patient?.patient_id}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-section-label">Patient Information</div>
          <div className="modal-grid">
            <div className="modal-field">
              <label>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Patient name"
              />
            </div>
            <div className="modal-field">
              <label>Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => handleChange("age", e.target.value)}
                placeholder="Years"
                min={0}
                max={120}
              />
            </div>
            <div className="modal-field">
              <label>Gender</label>
              <select
                value={form.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div className="modal-section-label" style={{ marginTop: 20 }}>Clinical Vitals</div>
          <div className="modal-grid">
            <div className="modal-field">
              <label>Heart Rate (bpm)</label>
              <input
                type="number"
                value={form.heart_rate}
                onChange={(e) => handleChange("heart_rate", e.target.value)}
                placeholder="e.g. 80"
              />
            </div>
            <div className="modal-field">
              <label>Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={form.temperature}
                onChange={(e) => handleChange("temperature", e.target.value)}
                placeholder="e.g. 37.0"
              />
            </div>
            <div className="modal-field">
              <label>Mean Arterial Pressure (mmHg)</label>
              <input
                type="number"
                value={form.mean_arterial_pressure}
                onChange={(e) => handleChange("mean_arterial_pressure", e.target.value)}
                placeholder="e.g. 90"
              />
            </div>
            <div className="modal-field">
              <label>pO2 (Oxygen Saturation)</label>
              <input
                type="number"
                value={form.oxygen_saturation}
                onChange={(e) => handleChange("oxygen_saturation", e.target.value)}
                placeholder="e.g. 95"
              />
            </div>
            <div className="modal-field">
              <label>Respiratory Rate (/min)</label>
              <input
                type="number"
                value={form.respiratory_rate}
                onChange={(e) => handleChange("respiratory_rate", e.target.value)}
                placeholder="e.g. 18"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <span className="spinner-inline" />
            ) : null}
            {saving ? "Saving & Re-predicting…" : "Save & Re-run Predictions"}
          </button>
        </div>
      </div>
    </div>
  );
}
