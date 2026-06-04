export default function ApacheScoreCard({ data, loading }) {
  if (loading) {
    return (
      <div className="card apache-card loading-card">
        <div className="card-header">
          <span className="card-label">APACHE Score</span>
        </div>
        <div className="skeleton-block" style={{ height: 80 }} />
      </div>
    );
  }

  if (!data) return null;

  const { apache_score } = data;

  const severityLabel =
    apache_score >= 35
      ? "Very High Severity"
      : apache_score >= 25
      ? "High Severity"
      : apache_score >= 15
      ? "Moderate Severity"
      : "Low Severity";

  const severityClass =
    apache_score >= 35
      ? "apache-critical"
      : apache_score >= 25
      ? "apache-high"
      : apache_score >= 15
      ? "apache-moderate"
      : "apache-low";

  // Score bar capped at 71 (clinical max meaningful value)
  const barPct = Math.min((apache_score / 71) * 100, 100);

  return (
    <div className="card apache-card">
      <div className="card-header">
        <span className="card-label">APACHE Score</span>
        <span className={`apache-severity-badge ${severityClass}`}>{severityLabel}</span>
      </div>

      <div className="apache-score-display">
        <div className="apache-score-value">{apache_score}</div>
        <div className="apache-score-max">/ 71</div>
      </div>

      <div className="apache-bar-track">
        <div
          className={`apache-bar-fill ${severityClass}`}
          style={{ width: `${barPct}%` }}
        />
      </div>

      <div className="apache-legend">
        <span className="apache-legend-item apache-low-label">0–14 Low</span>
        <span className="apache-legend-item apache-moderate-label">15–24 Mod</span>
        <span className="apache-legend-item apache-high-label">25–34 High</span>
        <span className="apache-legend-item apache-critical-label">35+ Critical</span>
      </div>
    </div>
  );
}
