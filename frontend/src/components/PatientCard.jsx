export default function PatientCard({ patient }) {
  const statusClass =
    patient.status === "ALIVE"
      ? "status-alive"
      : patient.status === "DEAD"
      ? "status-dead"
      : "status-unknown";

  const initials = patient.name
    ? patient.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "PT";

  return (
    <div className="card patient-card">
      <div className="card-header">
        <span className="card-label">Patient Profile</span>
        <span className={`status-badge ${statusClass}`}>{patient.status || "Unknown"}</span>
      </div>

      <div className="patient-profile-row">
        <div className="patient-avatar">{initials}</div>
        <div className="patient-identity">
          <div className="patient-name">{patient.name}</div>
          <div className="patient-id-line">
            <span className="patient-id-badge">{patient.patient_id}</span>
          </div>
        </div>
      </div>

      <div className="patient-details-grid">
        <div className="patient-detail-item">
          <span className="detail-label">Age</span>
          <span className="detail-value">{patient.age != null ? `${patient.age} yrs` : "—"}</span>
        </div>
        <div className="patient-detail-item">
          <span className="detail-label">Gender</span>
          <span className="detail-value">{patient.gender || "—"}</span>
        </div>
        <div className="patient-detail-item">
          <span className="detail-label">Diagnosis</span>
          <span className="detail-value">{patient.diagnosis || "—"}</span>
        </div>
        <div className="patient-detail-item">
          <span className="detail-label">Ward</span>
          <span className="detail-value">{patient.ward || "—"}</span>
        </div>
        <div className="patient-detail-item">
          <span className="detail-label">Admitted</span>
          <span className="detail-value">{patient.admission_date !== "Unknown" ? patient.admission_date : "—"}</span>
        </div>
        <div className="patient-detail-item">
          <span className="detail-label">Location</span>
          <span className="detail-value">{patient.location !== "Unknown" ? patient.location : "—"}</span>
        </div>
      </div>

      <div className="vitals-strip">
        <div className="vital-chip">
          <span className="vital-icon">♥</span>
          <span className="vital-num">{patient.vitals?.heart_rate ?? "—"}</span>
          <span className="vital-unit">bpm</span>
        </div>
        <div className="vital-chip">
          <span className="vital-icon">🌡</span>
          <span className="vital-num">{patient.vitals?.temperature ?? "—"}</span>
          <span className="vital-unit">°C</span>
        </div>
        <div className="vital-chip">
          <span className="vital-icon">💧</span>
          <span className="vital-num">{patient.vitals?.mean_arterial_pressure ?? "—"}</span>
          <span className="vital-unit">mmHg</span>
        </div>
        <div className="vital-chip">
          <span className="vital-icon">🫁</span>
          <span className="vital-num">{patient.vitals?.respiratory_rate ?? "—"}</span>
          <span className="vital-unit">/min</span>
        </div>
        <div className="vital-chip">
          <span className="vital-icon">O₂</span>
          <span className="vital-num">{patient.vitals?.oxygen_saturation ?? "—"}</span>
          <span className="vital-unit">pO2</span>
        </div>
      </div>
    </div>
  );
}
