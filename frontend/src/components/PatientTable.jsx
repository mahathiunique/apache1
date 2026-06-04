export default function PatientTable({ patients, onEdit, loading }) {
  if (loading) {
    return (
      <div className="patient-table-wrap">
        <table className="patient-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Diagnosis</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j}>
                    <div className="skeleton-inline" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <div className="table-empty">
        <p>No patients found.</p>
      </div>
    );
  }

  return (
    <div className="patient-table-wrap">
      <table className="patient-table">
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Diagnosis</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p, i) => {
            const statusClass =
              p.status === "ALIVE"
                ? "status-alive"
                : p.status === "DEAD"
                ? "status-dead"
                : "status-unknown";
            return (
              <tr key={p.patient_id || i} className="table-row">
                <td>
                  <span className="table-id-badge">{p.patient_id}</span>
                </td>
                <td className="table-name">{p.name}</td>
                <td>{p.age != null ? p.age : "—"}</td>
                <td>{p.gender || "—"}</td>
                <td>{p.diagnosis || "—"}</td>
                <td>
                  <span className={`status-badge ${statusClass}`}>{p.status || "Unknown"}</span>
                </td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => onEdit(p)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
