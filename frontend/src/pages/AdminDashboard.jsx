import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function AdminDashboard() {
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE}/api/kyc/all`);
      setList(res.data);
    } catch (err) {
      setError("Backend not running / cannot load KYC list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const stats = useMemo(() => {
    const total = list.length;
    const verified = list.filter((x) => x.status === "Verified").length;
    const rejected = list.filter((x) => x.status === "Rejected").length;
    const pending = list.filter((x) => x.status === "Pending").length;
    return { total, verified, rejected, pending };
  }, [list]);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "26px", marginBottom: "10px" }}>
        Admin Dashboard
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <StatCard title="Total" value={stats.total} />
        <StatCard title="Verified" value={stats.verified} />
        <StatCard title="Rejected" value={stats.rejected} />
        <StatCard title="Pending" value={stats.pending} />
      </div>

      <button
        onClick={fetchAll}
        style={{
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          cursor: "pointer",
          marginBottom: "14px",
        }}
      >
        Refresh
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
              <th style={{ padding: "10px" }}>Name</th>
              <th style={{ padding: "10px" }}>Email</th>
              <th style={{ padding: "10px" }}>Doc</th>
              <th style={{ padding: "10px" }}>Status</th>
              <th style={{ padding: "10px" }}>Risk</th>
              <th style={{ padding: "10px" }}>Face</th>
              <th style={{ padding: "10px" }}>Created</th>
            </tr>
          </thead>

          <tbody>
            {list.map((k) => (
              <tr key={k._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px" }}>{k.fullName}</td>
                <td style={{ padding: "10px" }}>{k.email}</td>
                <td style={{ padding: "10px" }}>{k.documentType}</td>
                <td style={{ padding: "10px", fontWeight: "bold" }}>
                  {k.status}
                </td>
                <td style={{ padding: "10px" }}>
                  {k.aiResult?.riskScore ?? "N/A"}
                </td>
                <td style={{ padding: "10px" }}>
                  {String(k.aiResult?.faceVerified ?? "N/A")}
                </td>
                <td style={{ padding: "10px" }}>
                  {new Date(k.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      style={{
        padding: "14px",
        border: "1px solid #ddd",
        borderRadius: "12px",
      }}
    >
      <div style={{ color: "#666", fontSize: "14px" }}>{title}</div>
      <div style={{ fontSize: "22px", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}
