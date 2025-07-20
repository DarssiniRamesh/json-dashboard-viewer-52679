import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import TopAppsPage from "./TopAppsPage";
import WordCloudPage from "./WordCloudPage";
import AnalyticsPage from "./AnalyticsPage";
import "./App.css";

// Sidebar with teal minimal styling and active highlighting
function Sidebar() {
  const location = useLocation();
  const links = [
    { to: "/", label: "Analytics" },
    { to: "/top-apps", label: "Top Apps" },
    { to: "/wordcloud", label: "Word Cloud" },
  ];
  return (
    <nav className="sidebar">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`sidebar-link${location.pathname === link.to ? " active" : ""}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app-root">
        <Sidebar />
        <main>
          {/* Header/Banner removed as instructed */}
          <Routes>
            <Route path="/" element={<AnalyticsPage />} />
            <Route path="/top-apps" element={<TopAppsPage />} />
            <Route path="/wordcloud" element={<WordCloudPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
