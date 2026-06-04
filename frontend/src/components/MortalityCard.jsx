export default function MortalityCard({ data, loading }) {
  if (loading) {
    return (
      <div className="card mortality-card loading-card">
        <div className="card-header">
          <span className="card-label">Mortality Risk</span>
        </div>
        <div className="skeleton-block" style={{ height: 80 }} />
      </div>
    );
  }

  if (!data) return null;

  const { mortality_probability, risk } = data;

  const riskClass =
    risk === "HIGH" ? "risk-high" : risk === "MEDIUM" ? "risk-medium" : "risk-low";

  const gaugeAngle = Math.min((mortality_probability / 100) * 180, 180);

  return (
    <div className={`card mortality-card ${riskClass}`}>
      <div className="card-header">
        <span className="card-label">Mortality Risk</span>
        <span className={`risk-badge ${riskClass}`}>{risk}</span>
      </div>

      <div className="mortality-gauge-wrap">
        <svg viewBox="0 0 120 70" className="mortality-gauge-svg">
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="#e5e9f0"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke={risk === "HIGH" ? "#ef4444" : risk === "MEDIUM" ? "#f97316" : "#22c55e"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(gaugeAngle / 180) * 157} 157`}
          />
          <text x="60" y="58" textAnchor="middle" className="gauge-value-text">
            {mortality_probability}%
          </text>
        </svg>
      </div>

      <div className="mortality-meta">
        <div className="mortality-meta-item">
          <span className="meta-dot" style={{ background: risk === "HIGH" ? "#ef4444" : risk === "MEDIUM" ? "#f97316" : "#22c55e" }} />
          <span>
            {risk === "HIGH"
              ? "Critical — immediate clinical review required"
              : risk === "MEDIUM"
              ? "Elevated — close monitoring advised"
              : "Stable — routine ICU protocols apply"}
          </span>
        </div>
      </div>
    </div>
  );
}
