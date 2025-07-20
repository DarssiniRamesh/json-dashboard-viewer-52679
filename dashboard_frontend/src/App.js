import React from "react";
import "./App.css";
import TopAppsPage from "./TopAppsPage";
import WordCloudPage from "./WordCloudPage";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Modern color palette
const COLORS = {
  primary: "#1976D2",
  secondary: "#f2f4f8",
  accent: "#FFC107",
  text: "#1a2b29",
};

function Sidebar() {
  return (
    <nav
      style={{
        width: 215,
        background: COLORS.secondary,
        borderRight: "1px solid #dde1ea",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        paddingTop: "2.5em",
        gap: "1.1em",
        minHeight: "100vh",
        fontWeight: 600,
      }}
    >
      <Link
        to="/"
        style={{
          textDecoration: "none",
          color: COLORS.primary,
          fontSize: "1.18em",
          margin: "0 1em 0.8em 2.2em",
        }}
      >
        Dashboard
      </Link>
      <Link
        to="/insights"
        style={{
          textDecoration: "none",
          color: "#424242",
          fontSize: "1.05em",
          margin: "0 1em 0 2.2em",
        }}
      >
        Insights
      </Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App" style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ flex: 1 }}>
          <header
            className="App-header"
            style={{
              background: COLORS.primary,
              color: "white",
              padding: "1.2em 2em",
              fontWeight: "bolder",
              borderTopLeftRadius: "2em",
              marginBottom: "1.2em",
            }}
          >
            Dashboard Demo
          </header>
          <main style={{ padding: "1.5em 2em" }}>
            <Routes>
              <Route path="/" element={<TopAppsPage />} />
              <Route path="/insights" element={<WordCloudPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
