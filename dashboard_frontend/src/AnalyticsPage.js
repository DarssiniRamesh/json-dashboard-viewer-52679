import React, { useEffect, useState } from "react";
import "./AnalyticsPage.css";

/**
 * PUBLIC_INTERFACE
 * Try to extract an array of apps from loaded JSON data, robustly handling:
 * - Root-level array (return as is if array of objects)
 * - Top-level object with 'apps' array property 
 * - Anything else results in []
 * Provides full diagnostics to console on parsing logic.
 */
function extractAppsArray(data) {
  if (Array.isArray(data)) {
    console.log("[Analytics Diagnostics] Detected root-level array in app.json.");
    // Validate all elements are objects (could be strict, or just warn)
    if (data.length && typeof data[0] === "object") {
      return data;
    } else {
      console.warn(
        "[Analytics Diagnostics] Root array in app.json does not appear to be a list of app objects."
      );
      return [];
    }
  }
  if (data && typeof data === "object" && Array.isArray(data.apps)) {
    console.log("[Analytics Diagnostics] Detected 'apps' array in app.json object.");
    return data.apps;
  }
  // Log problems if none matched
  console.error(
    "[Analytics Diagnostics] app.json was neither an array at root nor an object with an 'apps' array property.",
    data
  );
  return [];
}

const AnalyticsPage = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("./app.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load app.json");
        }
        return response.json();
      })
      .then((data) => {
        const loadedApps = extractAppsArray(data);
        setApps(loadedApps);
        setLoading(false);

        // Additional diagnostic output (numbers, sample)
        console.info(`[Analytics Diagnostics] Loaded ${loadedApps.length} app entries.`);
        if (loadedApps.length) {
          console.debug(
            "[Analytics Diagnostics] Sample app entry:",
            loadedApps[0]
          );
        }
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
        console.error("[Analytics Diagnostics] Failed to load app.json:", err);
      });
  }, []);

  // Chart: Histogram of app categories (works with either structure)
  function renderAppStats() {
    if (!apps || apps.length === 0) {
      console.warn(
        "[Analytics Diagnostics] No app data available for category histogram."
      );
      return <div>No app data available.</div>;
    }
    // Count apps by a property, e.g., 'category'
    const categoryCounts = {};
    apps.forEach((app) => {
      const cat =
        app && typeof app === "object" && app.category
          ? String(app.category).trim()
          : "Uncategorized";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    return (
      <div className="histogram">
        <h2>App Category Histogram</h2>
        <ul>
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <li key={cat}>
              {cat}:{" "}
              <span
                style={{
                  display: "inline-block",
                  width: `${count * 30}px`,
                  background: "#1976D2",
                  color: "white",
                  padding: "2px 8px",
                  marginRight: 8,
                }}
              >
                {count}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Chart: List loaded apps (works regardless of array structure)
  function renderAppList() {
    if (!apps || apps.length === 0) return null;
    return (
      <div>
        <h2>Loaded Apps ({apps.length})</h2>
        <ul>
          {apps.map((app, idx) => (
            <li key={idx}>{(app && app.name) || <i>Unnamed app</i>}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="analytics-page">
      <h1>Analytics Dashboard</h1>
      {renderAppStats()}
      {renderAppList()}
    </div>
  );
};

export default AnalyticsPage;
