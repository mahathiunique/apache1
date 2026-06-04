import { useState } from "react";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import ReceptionDashboard from "./pages/ReceptionDashboard.jsx";

export default function App() {
  const [role, setRole] = useState(null);

  if (!role) {
    return (
      <div className="role-select-screen">
        <div className="role-select-card">
          <div className="brand-mark">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="#1a56db" />
              <path d="M18 8v20M8 18h20" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <circle cx="18" cy="18" r="5" stroke="white" strokeWidth="2" fill="none" />
            </svg>
            <div>
              <div className="brand-name">APACHE-1</div>
              <div className="brand-sub">ICU AI Decision Support System</div>
            </div>
          </div>

          <div className="role-select-divider" />

          <h2 className="role-select-title">Select Your Role</h2>
          <p className="role-select-desc">
            Choose the dashboard that matches your hospital role to continue.
          </p>

          <div className="role-cards">
            <button className="role-card" onClick={() => setRole("patient")}>
              <div className="role-icon role-icon-patient">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="role-card-info">
                <div className="role-card-title">Patient View</div>
                <div className="role-card-desc">Clinical predictions, vitals, AI insights</div>
              </div>
              <svg className="role-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <button className="role-card" onClick={() => setRole("reception")}>
              <div className="role-icon role-icon-reception">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                  <path d="M7 8h10M7 12h6" />
                </svg>
              </div>
              <div className="role-card-info">
                <div className="role-card-title">Reception / Admin</div>
                <div className="role-card-desc">Patient management, edit records, re-run predictions</div>
              </div>
              <svg className="role-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="role-select-footer">
            Apollo Hospitals · Certified Clinical AI Platform · v1.0
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      {role === "patient" && (
        <PatientDashboard onLogout={() => setRole(null)} />
      )}
      {role === "reception" && (
        <ReceptionDashboard onLogout={() => setRole(null)} />
      )}
    </div>
  );
}
