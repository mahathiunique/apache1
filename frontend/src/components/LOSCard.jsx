export default function LOSCard({ data, loading }) {
  if (loading) {
    return (
      <div className="card los-card loading-card">
        <div className="card-header">
          <span className="card-label">Predicted Length of Stay</span>
        </div>
        <div className="skeleton-block" style={{ height: 80 }} />
      </div>
    );
  }

  if (!data) return null;

  const { los_prediction, los_days, los_hours } = data;

  const severityLabel =
    los_days >= 14
      ? "Extended Stay"
      : los_days >= 7
      ? "Prolonged Stay"
      : los_days >= 3
      ? "Moderate Stay"
      : "Short Stay";

  const severityClass =
    los_days >= 14
      ? "los-severe"
      : los_days >= 7
      ? "los-moderate"
      : los_days >= 3
      ? "los-standard"
      : "los-brief";

  return (
    <div className="card los-card">
      <div className="card-header">
        <span className="card-label">Predicted Length of Stay</span>
        <span className={`los-severity-badge ${severityClass}`}>{severityLabel}</span>
      </div>

      <div className="los-main">
        <div className="los-big-number">{los_days}</div>
        <div className="los-unit-label">days</div>
        {los_hours > 0 && (
          <div className="los-hours-label">+ {los_hours} hours</div>
        )}
      </div>

      <div className="los-breakdown">
        <div className="los-breakdown-item">
          <span className="los-breakdown-label">Total Estimate</span>
          <span className="los-breakdown-value">{los_prediction} days</span>
        </div>
        <div className="los-breakdown-item">
          <span className="los-breakdown-label">Days</span>
          <span className="los-breakdown-value">{los_days}</span>
        </div>
        <div className="los-breakdown-item">
          <span className="los-breakdown-label">Hours</span>
          <span className="los-breakdown-value">{los_hours}</span>
        </div>
      </div>
    </div>
  );
}
