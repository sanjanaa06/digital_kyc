import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import LivenessCheck from "../components/LivenessCheck";

export default function KycForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [documentType, setDocumentType] = useState("PAN");

  const [document, setDocument] = useState(null);
  const [selfie, setSelfie] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!fullName || !email || !document) {
      setError("Please enter name, email and upload document.");
      return;
    }

    if (!selfie) {
      setError("Please complete live selfie liveness first.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("documentType", documentType);
      formData.append("document", document);
      formData.append("selfie", selfie);

      const res = await axios.post(`${API_BASE}/api/kyc/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data.kyc);
    } catch (err) {
      setError(err?.response?.data?.error || "Backend error / not running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "26px", marginBottom: "8px" }}>
        Digital KYC Verification
      </h2>

      <p style={{ color: "#555", marginBottom: "18px" }}>
        Upload your PAN/Aadhaar and complete live selfie verification. The system
        performs OCR + Face Match and generates a risk score.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "12px",
          padding: "16px",
          border: "1px solid #ddd",
          borderRadius: "12px",
        }}
      >
        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
        />

        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
        >
          <option value="PAN">PAN</option>
          <option value="AADHAAR">AADHAAR</option>
        </select>

        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>
            Upload Document (PAN/Aadhaar image)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setDocument(e.target.files[0])}
          />
        </div>

        {/* Live Selfie Liveness */}
        <LivenessCheck onCapture={(file) => setSelfie(file)} />

        {selfie && (
          <p style={{ marginTop: "6px", color: "green" }}>
            Live selfie captured successfully ✅
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            background: "black",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            marginTop: "6px",
          }}
        >
          {loading ? "Verifying..." : "Submit KYC"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      {result && (
        <div
          style={{
            marginTop: "18px",
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "12px",
          }}
        >
          <h3 style={{ marginBottom: "8px" }}>KYC Result</h3>

          <p>
            <b>Status:</b>{" "}
            <span
              style={{
                color: result.status === "Verified" ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {result.status}
            </span>
          </p>

          <p>
            <b>Risk Score:</b> {result.aiResult?.riskScore ?? "N/A"}
          </p>

          <p>
            <b>Face Verified:</b>{" "}
            {String(result.aiResult?.faceVerified ?? "N/A")}
          </p>

          <p>
            <b>Face Distance:</b>{" "}
            {result.aiResult?.faceDistance?.toFixed?.(4) ?? "N/A"}
          </p>

          <div style={{ marginTop: "10px" }}>
            <b>OCR Extracted Text:</b>
            <div
              style={{
                marginTop: "6px",
                padding: "10px",
                background: "#f6f6f6",
                borderRadius: "8px",
                maxHeight: "160px",
                overflow: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {result.aiResult?.ocrText || "No OCR text extracted"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
