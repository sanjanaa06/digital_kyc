import { Routes, Route, Link } from "react-router-dom";
import KycForm from "./pages/KycForm";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <nav
        style={{
          display: "flex",
          gap: "16px",
          padding: "14px 20px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          KYC Form
        </Link>
        <Link to="/admin" style={{ textDecoration: "none" }}>
          Admin Dashboard
        </Link>
      </nav>

      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<KycForm />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </div>
  );
}
