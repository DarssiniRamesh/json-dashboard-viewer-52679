import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import "./App.css";

// PUBLIC_INTERFACE
function App() {
  /**
   * Main App entrypoint for the Oceanic Analytics Dashboard.
   * Loads analytics data from a static JSON, handles dark/blue theme.
   */
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch local appvote.json asynchronously
    fetch("./appvote.json")
      .then((resp) => resp.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        alert(
          "Failed to load data: appvote.json is missing or malformed. Please ensure the JSON is present in /src."
        );
        setLoading(false);
      });
  }, []);

  // Modern oceanic blue gradient background
  return (
    <div className="app-root">
      <header className="header">
        <h1>
          <span role="img" aria-label="ocean">
            🌊
          </span>{" "}
          Oceanic Analytics Dashboard
        </h1>
      </header>
      {loading ? (
        <div className="loading">Loading analytics…</div>
      ) : data ? (
        <Dashboard data={data} />
      ) : (
        <div className="error">Dashboard data is unavailable.</div>
      )}
      <footer className="footer">
        <span>
          &copy; {new Date().getFullYear()} Oceanic Dashboard. Powered by appvote.json.
        </span>
      </footer>
    </div>
  );
}

export default App;
