import { useState, useEffect } from "react";
import PatientTable from "../components/PatientTable.jsx";
import EditPatientModal from "../components/EditPatientModal.jsx";
import MortalityCard from "../components/MortalityCard.jsx";
import LOSCard from "../components/LOSCard.jsx";
import ApacheScoreCard from "../components/ApacheScoreCard.jsx";
import AdmissionsPage from "./AdmissionsPage.jsx";
import ReportsPage from "./ReportsPage.jsx";
import { listPatients, runAllPredictions } from "../services/api.js";

export default function ReceptionDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("patients");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  const [editPatient, setEditPatient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [predResults, setPredResults] = useState(null);
  const [predPatient, setPredPatient] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);

  useEffect(() => {
    if (activeTab !== "patients") return;
    setLoading(true);
    setError(null);
    listPatients(page, LIMIT)
      .then((data) => {
        setPatients(data.patients || []);
        setTotal(data.total || 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, activeTab]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredPatients(
        patients.filter(
          (p) =>
            (p.patient_id || "").toLowerCase().includes(q) ||
            (p.name || "").toLowerCase().includes(q) ||
            (p.diagnosis || "").toLowerCase().includes(q) ||
            (p.gender || "").toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, patients]);

  const handleEdit = (patient) => {
    setEditPatient(patient);
    setPredResults(null);
    setPredPatient(null);
  };

  const handleSave = async (updatedPatient) => {
    setSaving(true);
    try {
      setPatients((prev) =>
        prev.map((p) =>
          p.patient_id === updatedPatient.patient_id ? updatedPatient : p
        )
      );
      const preds = await runAllPredictions(updatedPatient.features);
      setPredResults(preds);
      setPredPatient(updatedPatient);
      setEditPatient(null);
    } catch (err) {
      alert(`Prediction error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const stats = {
    total: total,
    alive: patients.filter((p) => p.status === "ALIVE").length,
    dead: patients.filter((p) => p.status === "DEAD").length,
  };

  const NAV = [
    {
      id: "patients",
      label: "Patient List",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      id: "admissions",
      label: "Admissions",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <line x1="12" y1="14" x2="12" y2="18"/>
          <line x1="10" y1="16" x2="14" y2="16"/>
        </svg>
      ),
    },
    {
      id: "reports",
      label: "Reports",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="#1a56db"/>
            <path d="M18 8v20M8 18h20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="18" cy="18" r="5" stroke="white" strokeWidth="2" fill="none"/>
          </svg>
          <div>
            <div className="sidebar-brand-name">APACHE-I</div>
            <div className="sidebar-brand-sub">Reception Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Menu</div>
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item${activeTab === item.id ? " active" : ""}`}
              onClick={() => setActiveTab(item.id)}
              style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-stats-panel">
          <div className="sidebar-nav-label">Quick Stats (This Page)</div>
          <div className="sidebar-stat-row">
            <span>Total Patients</span>
            <span className="stat-val-blue">{total.toLocaleString()}</span>
          </div>
          <div className="sidebar-stat-row">
            <span>Alive</span>
            <span className="stat-val-green">{stats.alive}</span>
          </div>
          <div className="sidebar-stat-row">
            <span>Deceased</span>
            <span className="stat-val-red">{stats.dead}</span>
          </div>
        </div>

        <button className="sidebar-logout" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Switch Role
        </button>
      </aside>

      <main className="dashboard-main">
        {/* PATIENT LIST */}
        {activeTab === "patients" && (
          <>
            <header className="dashboard-topbar">
              <div>
                <h1 className="topbar-title">Patient Management</h1>
                <p className="topbar-sub">
                  {total.toLocaleString()} total records · Page {page} of {totalPages || 1}
                </p>
              </div>
              <input
                className="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by ID, name, diagnosis…"
                style={{ width: 260 }}
              />
            </header>

            {error && (
              <div className="error-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {predResults && predPatient && (
              <div className="pred-result-banner">
                <div className="pred-result-header">
                  <div>
                    <div className="pred-result-title">
                      Predictions updated for <strong>{predPatient.name}</strong>
                    </div>
                    <div className="pred-result-sub">{predPatient.patient_id}</div>
                  </div>
                  <button className="pred-result-close" onClick={() => setPredResults(null)}>✕</button>
                </div>
                <div className="pred-result-cards">
                  <MortalityCard data={predResults.mortality} loading={false} />
                  <LOSCard data={predResults.los} loading={false} />
                  <ApacheScoreCard data={predResults.apache} loading={false} />
                </div>
              </div>
            )}

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="table-toolbar">
                <span className="table-count">
                  Showing {filteredPatients.length} of {total.toLocaleString()} patients
                </span>
              </div>
              <PatientTable patients={filteredPatients} onEdit={handleEdit} loading={loading} />
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  ← Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={p} className={`page-btn ${p === page ? "page-btn-active" : ""}`} onClick={() => setPage(p)}>
                      {p}
                    </button>
                  );
                })}
                <button className="page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* ADMISSIONS */}
        {activeTab === "admissions" && (
          <>
            <header className="dashboard-topbar">
              <div>
                <h1 className="topbar-title">New Admission</h1>
                <p className="topbar-sub">Register a new patient and auto-generate AI predictions</p>
              </div>
            </header>
            <AdmissionsPage />
          </>
        )}

        {/* REPORTS */}
        {activeTab === "reports" && (
          <>
            <header className="dashboard-topbar">
              <div>
                <h1 className="topbar-title">Analytics & Reports</h1>
                <p className="topbar-sub">Dataset-wide clinical outcome statistics</p>
              </div>
            </header>
            <ReportsPage />
          </>
        )}
      </main>

      {editPatient && (
        <EditPatientModal
          patient={editPatient}
          onSave={handleSave}
          onClose={() => setEditPatient(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
