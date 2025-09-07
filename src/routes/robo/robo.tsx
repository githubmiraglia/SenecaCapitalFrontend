import React, { useState } from "react";
import { api } from "../../api";
import "../../css/robo.css";

const Robo = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await api.post("/api/run-playwright/");
      console.log("🟢 Backend response:", res.data);
      setResults(res.data);
    } catch (err: any) {
      console.error("❌ Error running scripts:", err);
      setError("Error running scripts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="robo-wrapper">
      <div className="robo-card">
        <h1 className="robo-title">Rodar Robô</h1>
        <button onClick={handleClick} className="robo-button" disabled={loading}>
          {loading ? "⏳ Running..." : "▶ Run All"}
        </button>

        {/* Show error */}
        {error && <p className="robo-error">{error}</p>}

        {/* Show only success/error for each script */}
        {results && (
          <div className="robo-results">
            {Object.entries(results).map(([script, result]: any) => (
              <div
                key={script}
                className={`robo-result ${
                  result.status === "success" ? "success" : "error"
                }`}
              >
                <span className="script-name">{script}</span>
                <span className="status">
                  {result.status === "success" ? "✅ Success" : "❌ Error"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Robo;
