import React from "react";
import "./App.css";
import TopAppsPage from "./TopAppsPage";
import WordCloudPage from "./WordCloudPage";
import AnalyticsPage from "./AnalyticsPage";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

/**
 * Sidebar navigation component styled for modern teal/minimal theme.
 * Navigation structure, routes and labels remain unchanged.
 */
// PUBLIC_INTERFACE
function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-title">Dashboard</div>
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `sidebar-link${isActive ? " active" : ""}`
        }
      >
        Top Apps
      </NavLink>
      <NavLink
        to="/insights"
        className={({ isActive }) =>
          `sidebar-link${isActive ? " active" : ""}`
        }
      >
        Insights
      </NavLink>
      <NavLink
        to="/analytics"
        className={({ isActive }) =>
          `sidebar-link${isActive ? " active" : ""}`
        }
      >
        Analytics
      </NavLink>
    </nav>
  );
}

// PUBLIC_INTERFACE
function App() {
  return (
    <Router>
      <div className="app-root">
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <header className="app-header">Dashboard Demo</header>
          <main>
            <Routes>
              <Route path="/" element={<TopAppsPage />} />
              <Route path="/insights" element={<WordCloudPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
