import { useState, useEffect } from "react";
import {
  getReportSummary,
  getDiagnosisDistribution,
  getMortalityByDiagnosis,
  getLOSDistribution,
  getApacheDistribution,
  getGenderDistribution,
  getWardDistribution,
  getRecentAdmissions,
} from "../services/api.js";

function StatCard({ label, value, sub, color }) {
  return (
    <div className="report-stat-card">
      <div className="report-stat-label">{label}</div>
      <div className="report-stat-value" style={{ color }}>{value ?? "—"}</div>
      {sub && <div className="report-stat-sub">{sub}</div>}
    </div>
  );
}

function BarChart({ data, labelKey, valueKey, color = "#1a56db", title, suffix = "" }) {
  if (!data || data.length === 0) return (
    <div className="chart-empty">No data available</div>
  );
  const max = Math.max(...data.map((d) => d[valueKey] || 0));
  return (
    <div className="chart-container">
      <div className="chart-title">{title}</div>
      <div className="bar-chart">
        {data.map((item, i) => (
          <div key={i} className="bar-row">
            <div className="bar-label" title={item[labelKey]}>{item[labelKey]}</div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${max > 0 ? (item[valueKey] / max) * 100 : 0}%`,
                  background: color,
                }}
              />
            </div>
            <div className="bar-value">{item[valueKey]}{suffix}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data, labelKey, valueKey, title }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data available</div>;
  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0);
  const COLORS = ["#1a56db", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#06b6d4", "#eab308", "#ef4444"];
  let cum = 0;
  const slices = data.map((item, i) => {
    const pct = total > 0 ? item[valueKey] / total : 0;
    const start = cum;
    cum += pct;
    return { ...item, pct, start, color: COLORS[i % COLORS.length] };
  });

  const describeArc = (startPct, endPct, r = 80, cx = 100, cy = 100) => {
    const start = startPct * 2 * Math.PI - Math.PI / 2;
    const end = endPct * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = endPct - startPct > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="chart-container">
      <div className="chart-title">{title}</div>
      <div className="donut-layout">
        <svg viewBox="0 0 200 200" width="140" height="140">
          {slices.map((s, i) => (
            <path key={i} d={describeArc(s.start, s.start + s.pct)} fill={s.color} opacity="0.9" />
          ))}
          <circle cx="100" cy="100" r="50" fill="var(--bg-card, #fff)" />
          <text x="100" y="96" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-primary, #111)">
            {total.toLocaleString()}
          </text>
          <text x="100" y="112" textAnchor="middle" fontSize="9" fill="var(--text-muted, #6b7280)">total</text>
        </svg>
        <div className="donut-legend">
          {slices.map((s, i) => (
            <div key={i} className="legend-row">
              <span className="legend-dot" style={{ background: s.color }} />
              <span className="legend-label">{s[labelKey]}</span>
              <span className="legend-val">{Math.round(s.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentAdmissionsTable({ data }) {
  if (!data || data.length === 0) return (
    <div className="chart-empty">No new admissions yet. Use the Admissions form to add patients.</div>
  );
  return (
    <table className="report-table">
      <thead>
        <tr>
          <th>Patient ID</th>
          <th>Name</th>
          <th>Age</th>
          <th>Diagnosis</th>
          <th>Ward</th>
          <th>Admitted</th>
          <th>Mortality Risk</th>
          <th>LOS</th>
          <th>APACHE</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p, i) => {
          const mort = p.predictions?.mortality;
          const los = p.predictions?.los;
          const apache = p.predictions?.apache;
          const riskColor = mort?.risk === "HIGH" ? "#ef4444" : mort?.risk === "MEDIUM" ? "#f97316" : "#22c55e";
          return (
            <tr key={i}>
              <td><code style={{ fontSize: 11 }}>{p.patient_id}</code></td>
              <td>{p.name}</td>
              <td>{p.age}</td>
              <td>{p.diagnosis}</td>
              <td>{p.ward}</td>
              <td style={{ whiteSpace: "nowrap" }}>{p.admission_date}</td>
              <td>
                {mort ? (
                  <span className="risk-pill" style={{ background: riskColor + "22", color: riskColor }}>
                    {mort.risk} · {mort.mortality_probability}%
                  </span>
                ) : "—"}
              </td>
              <td>{los ? `${los.los_days}d ${los.los_hours}h` : "—"}</td>
              <td>{apache ? apache.apache_score : "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [diagDist, setDiagDist] = useState([]);
  const [mortByDiag, setMortByDiag] = useState([]);
  const [losDist, setLosDist] = useState([]);
  const [apacheDist, setApacheDist] = useState([]);
  const [genderDist, setGenderDist] = useState([]);
  const [wardDist, setWardDist] = useState([]);
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getReportSummary(),
      getDiagnosisDistribution(),
      getMortalityByDiagnosis(),
      getLOSDistribution(),
      getApacheDistribution(),
      getGenderDistribution(),
      getWardDistribution(),
      getRecentAdmissions(10),
    ])
      .then(([sum, diag, mort, los, apache, gender, ward, recent]) => {
        setSummary(sum);
        setDiagDist(diag.data || []);
        setMortByDiag(mort.data || []);
        setLosDist(los.data || []);
        setApacheDist(apache.data || []);
        setGenderDist(gender.data || []);
        setWardDist(ward.data || []);
        setRecentAdmissions(recent.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-state">
      <div className="spinner" />
      <span>Loading reports…</span>
    </div>
  );

  if (error) return (
    <div className="error-banner" style={{ margin: 24 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {error}
    </div>
  );

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h2 className="admissions-title">Analytics & Reports</h2>
        <p className="admissions-sub">Dataset-wide statistics and clinical outcome trends.</p>
      </div>

      {/* Summary KPIs */}
      <div className="report-stats-grid">
        <StatCard label="Total Patients" value={summary?.total_patients?.toLocaleString()} color="#1a56db" />
        <StatCard label="Alive" value={summary?.alive?.toLocaleString()} color="#22c55e" />
        <StatCard label="Deceased" value={summary?.dead?.toLocaleString()} color="#ef4444" />
        <StatCard label="Mortality Rate" value={summary?.mortality_rate != null ? `${summary.mortality_rate}%` : "—"} color="#f97316" />
        <StatCard label="Avg LOS" value={summary?.avg_los_days != null ? `${summary.avg_los_days}d` : "—"} sub="Mean length of stay" color="#a855f7" />
        <StatCard label="Median LOS" value={summary?.median_los_days != null ? `${summary.median_los_days}d` : "—"} sub="Median length of stay" color="#06b6d4" />
        <StatCard label="Avg APACHE Score" value={summary?.avg_apache_score != null ? summary.avg_apache_score : "—"} color="#eab308" />
        <StatCard label="New Admissions" value={summary?.new_admissions ?? 0} sub="Via admissions form" color="#1a56db" />
      </div>

      {/* Charts row 1 */}
      <div className="report-charts-row">
        <div className="card report-chart-card">
          <BarChart
            data={diagDist}
            labelKey="label"
            valueKey="count"
            title="Patients by Diagnosis Category"
            color="#1a56db"
          />
        </div>
        <div className="card report-chart-card">
          <BarChart
            data={mortByDiag}
            labelKey="diagnosis"
            valueKey="mortality_rate"
            title="Mortality Rate by Diagnosis (%)"
            color="#ef4444"
            suffix="%"
          />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="report-charts-row">
        <div className="card report-chart-card">
          <BarChart
            data={losDist}
            labelKey="range"
            valueKey="count"
            title="Length of Stay Distribution"
            color="#22c55e"
          />
        </div>
        <div className="card report-chart-card">
          <BarChart
            data={apacheDist}
            labelKey="band"
            valueKey="count"
            title="APACHE Score Severity Bands"
            color="#f97316"
          />
        </div>
      </div>

      {/* Charts row 3 */}
      <div className="report-charts-row">
        <div className="card report-chart-card">
          <DonutChart
            data={genderDist}
            labelKey="gender"
            valueKey="count"
            title="Gender Distribution"
          />
        </div>
        <div className="card report-chart-card">
          <BarChart
            data={wardDist}
            labelKey="ward"
            valueKey="count"
            title="Patients by Ward"
            color="#a855f7"
          />
        </div>
      </div>

      {/* Recent Admissions */}
      <div className="card" style={{ marginTop: 24, overflow: "hidden" }}>
        <div className="card-header" style={{ padding: "16px 20px 0" }}>
          <span className="card-label">Recent Manual Admissions</span>
          <span className="ai-badge" style={{ background: "#1a56db22", color: "#1a56db", border: "1px solid #1a56db44" }}>
            {recentAdmissions.length} records
          </span>
        </div>
        <div style={{ overflowX: "auto", padding: "12px 0 0" }}>
          <RecentAdmissionsTable data={recentAdmissions} />
        </div>
      </div>
    </div>
  );
}
