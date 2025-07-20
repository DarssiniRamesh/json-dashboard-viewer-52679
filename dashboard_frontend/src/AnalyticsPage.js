import React, { useEffect, useState } from "react";
import "./AnalyticsPage.css";

/**
 * AnalyticsPage - dashboard for app analytics
 * Loads data from /app.json via fetch, displays analytics, and provides diagnostics and robust error handling.
 */
function AnalyticsPage() {
  // Set up state for data and loading/errors
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from /app.json on mount
    fetch('/app.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load app.json: ${response.statusText} (${response.status})`);
        }
        return response.json();
      })
      .then(
        (json) => {
          setData(json);
          setError(null);
        },
        (err) => {
          setError("Failed to parse app.json: " + err.message);
          setData(null);
        }
      )
      .catch((err) => {
        setError("Unexpected error: " + err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Diagnostic utilities for data checks
  function renderDiagnostics(data) {
    if (!data) return null;
    const warnings = [];

    // Diagnostics for expected data schema
    if (!Array.isArray(data.apps)) {
      warnings.push("Warning: Expected 'apps' as an array in app.json.");
    } else if (data.apps.length === 0) {
      warnings.push("Warning: No entries found in 'apps'.");
    } else {
      data.apps.forEach((app, idx) => {
        if (!app.name) warnings.push(`App entry at index ${idx} missing 'name' field.`);
        if (typeof app.usage !== "number") warnings.push(`App '${app.name || idx}' missing or invalid 'usage' (should be a number).`);
      });
    }
    // Additional diagnostic checks can be added as needed

    if (warnings.length === 0) return null;
    return (
      <div className="analytics-diagnostics" style={{margin: "1em 0", background: "#fff3cd", padding: "1em", borderRadius: "6px", border: "1px solid #ffeeba"}}>
        <b>Diagnostics/Warnings:</b>
        <ul>
          {warnings.map((w, i) => (<li key={i} style={{color: "orange"}}>{w}</li>))}
        </ul>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <h1>App Analytics Dashboard</h1>
      {loading && <div>Loading data from <code>/app.json</code> ...</div>}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {renderDiagnostics(data)}
      {/* The charts and analytics widgets use the dynamically loaded 'data' */}
      {data && Array.isArray(data.apps) && (
        <div className="analytics-charts">
          <h2>Top Apps by Usage</h2>
          <ol>
            {data.apps
              .slice()
              .sort((a, b) => b.usage - a.usage)
              .map((app, idx) => (
                <li key={app.name || idx}>
                  <b>{app.name || "Unnamed App"}</b>: {typeof app.usage === "number" ? app.usage : "N/A"}
                </li>
              ))}
          </ol>
          {/* Additional charts or widgets can use 'data.apps' as needed */}
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;
