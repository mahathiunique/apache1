import { useState, useEffect, useCallback } from "react";
import PatientCard from "../components/PatientCard.jsx";
import MortalityCard from "../components/MortalityCard.jsx";
import LOSCard from "../components/LOSCard.jsx";
import ApacheScoreCard from "../components/ApacheScoreCard.jsx";
import { getPatient, runAllPredictions, listPatients } from "../services/api.js";

function generateInsights(patient, mortality, los, apache) {
  const insights = [];
  const name = patient?.name || "The patient";

  if (mortality) {
    if (mortality.risk === "HIGH") {
      insights.push(
        `${name} has a critically elevated mortality probability of ${mortality.mortality_probability}%. Immediate senior physician review and escalation of care are strongly advised.`
      );
    } else if (mortality.risk === "MEDIUM") {
      insights.push(
        `${name} shows an elevated mortality risk of ${mortality.mortality_probability}%. Close monitoring and proactive intervention planning are recommended.`
      );
    } else {
      insights.push(
        `${name} has a low estimated mortality risk of ${mortality.mortality_probability}%. Continue standard ICU monitoring protocols.`
      );
    }
  }

  if (los) {
    if (los.los_days >= 14) {
      insights.push(
        `An extended ICU stay of approximately ${los.los_days} days is predicted. Bed occupancy planning and long-term care coordination should be initiated early.`
      );
    } else if (los.los_days >= 7) {
      insights.push(
        `A prolonged stay of ${los.los_days} days is anticipated. Regular multi-disciplinary team reviews are advised to optimize recovery trajectory.`
      );
    } else {
      insights.push(
        `Predicted ICU length of stay is ${los.los_days} day${los.los_days !== 1 ? "s" : ""} and ${los.los_hours} hour${los.los_hours !== 1 ? "s" : ""}. Standard discharge planning may begin proactively.`
      );
    }
  }

  if (apache) {
    if (apache.apache_score >= 35) {
      insights.push(
        `APACHE score of ${apache.apache_score} indicates very high physiological severity. Intensive organ support and critical care protocols are strongly indicated.`
      );
    } else if (apache.apache_score >= 25) {
      insights.push(
        `APACHE score of ${apache.apache_score} reflects high acuity illness. Frequent reassessment of treatment goals is recommended.`
      );
    } else if (apache.apache_score >= 15) {
      insights.push(
        `Moderate APACHE score of ${apache.apache_score}. Continue current management with regular clinical reassessment.`
      );
    } else {
      insights.push(
        `Low APACHE score of ${apache.apache_score} suggests relative physiological stability at current presentation.`
      );
    }
  }

  if (patient?.vitals?.heart_rate > 120) {
    insights.push("Tachycardia noted. Evaluate for underlying cause and consider rate management.");
  }
  if (patient?.vitals?.temperature > 38.5) {
    insights.push("Pyrexia detected. Sepsis workup and appropriate antimicrobial coverage should be reviewed.");
  }
  if (patient?.vitals?.mean_arterial_pressure < 65) {
    insights.push("Mean arterial pressure below 65 mmHg. Hemodynamic support and vasopressor consideration warranted.");
  }

  return insights;
}

export default function PatientDashboard({ onLogout }) {
  const [patientId, setPatientId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [patient, setPatient] = useState(null);
  const [predictions, setPredictions] = useState({ mortality: null, los: null, apache: null });
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [error, setError] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    listPatients(1, 5)
      .then((data) => setRecentPatients(data.patients || []))
      .catch(() => {});
  }, []);

  const loadPatient = useCallback(async (id) => {
    setError(null);
    setLoadingPatient(true);
    setPatient(null);
    setPredictions({ mortality: null, los: null, apache: null });

    try {
      const p = await getPatient(id);
      setPatient(p);
      setLoadingPredictions(true);
      const preds = await runAllPredictions(p.features);
      setPredictions(preds);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPatient(false);
      setLoadingPredictions(false);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setPatientId(searchInput.trim());
      loadPatient(searchInput.trim());
    }
  };

  const insights = generateInsights(patient, predictions.mortality, predictions.los, predictions.apache);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="#1a56db" />
            <path d="M18 8v20M8 18h20" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <circle cx="18" cy="18" r="5" stroke="white" strokeWidth="2" fill="none" />
          </svg>
          <div>
            <div className="sidebar-brand-name">APACHE-I</div>
            <div className="sidebar-brand-sub">ICU Decision Support</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Navigation</div>
          <a className="sidebar-nav-item active" href="#">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Patient Overview
          </a>
          <a className="sidebar-nav-item" href="#">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Vitals Monitor
          </a>
          <a className="sidebar-nav-item" href="#">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            History
          </a>
        </nav>

        <div className="sidebar-recent">
          <div className="sidebar-nav-label">Recent Patients</div>
          {recentPatients.map((p) => (
            <button
              key={p.patient_id}
              className={`sidebar-recent-item ${patientId === p.patient_id ? "active" : ""}`}
              onClick={() => {
                setSearchInput(p.patient_id);
                setPatientId(p.patient_id);
                loadPatient(p.patient_id);
              }}
            >
              <div className="sidebar-recent-avatar">
                {(p.name || "P").slice(-2).toUpperCase()}
              </div>
              <div>
                <div className="sidebar-recent-name">{p.name}</div>
                <div className="sidebar-recent-id">{p.patient_id}</div>
              </div>
            </button>
          ))}
        </div>

        <button className="sidebar-logout" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Switch Role
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1 className="topbar-title">Patient Dashboard</h1>
            <p className="topbar-sub">AI-powered clinical decision support for ICU staff</p>
          </div>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              className="search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Patient ID or UHID…"
            />
            <button type="submit" className="btn-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Search
            </button>
          </form>
        </header>

        {error && (
          <div className="error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {loadingPatient && (
          <div className="loading-state">
            <div className="spinner" />
            <span>Loading patient data…</span>
          </div>
        )}

        {!patient && !loadingPatient && !error && (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <h3>No patient selected</h3>
            <p>Search for a patient by ID or select from recent patients in the sidebar.</p>
          </div>
        )}

        {patient && (
          <>
            <div className="dashboard-grid">
              <div className="grid-col-left">
                <PatientCard patient={patient} />

                {insights.length > 0 && (
                  <div className="card insights-card">
                    <div className="card-header">
                      <span className="card-label">AI Clinical Insights</span>
                      <span className="ai-badge">AI Generated</span>
                    </div>
                    <ul className="insights-list">
                      {insights.map((insight, i) => (
                        <li key={i} className="insight-item">
                          <span className="insight-dot" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid-col-right">
                <MortalityCard data={predictions.mortality} loading={loadingPredictions} />
                <LOSCard data={predictions.los} loading={loadingPredictions} />
                <ApacheScoreCard data={predictions.apache} loading={loadingPredictions} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
