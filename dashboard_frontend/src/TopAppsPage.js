import React, { useState } from "react";
import appData from "./app.json";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * Top 10 Apps per Week Page
 * Modern teal-themed grid layout, tab selector for Week 1-4/All, responsive cards.
 */
const COLORS = {
  primary: "#008080",
  secondary: "#E0F2F1",
  accent: "#A7FFEB",
  text: "#222c2b",
  white: "#fff",
  grey: "#adb5bd",
  card: "#f8fafc",
};

const groupByWeek = (entries) => {
  const weeks = {};
  entries.forEach((el) => {
    const weekId = el.contest_week_id || "0";
    if (!weeks[weekId]) {
      const label = el.contest_week_name || (weekId ? `Week ${weekId}` : "Week Unknown");
      weeks[weekId] = { label, entries: [] };
    }
    weeks[weekId].entries.push(el);
  });
  return weeks;
};

function getSortedTopApps(entries) {
  return entries
    .slice()
    .sort(
      (a, b) =>
        (b.vote_count ?? b.votes ?? 0) - (a.vote_count ?? a.votes ?? 0) ||
        (b.visit_count ?? 0) - (a.visit_count ?? 0)
    )
    .slice(0, 10);
}

function WeekTabs({ weekIds, weeks, activeWeek, onWeekChange }) {
  return (
    <div className="topapps-tabs">
      <button
        className={`topapps-tab${activeWeek === "all" ? " active" : ""}`}
        onClick={() => onWeekChange("all")}
      >
        All Weeks
      </button>
      {weekIds.map((weekId) => (
        <button
          className={`topapps-tab${activeWeek === weekId ? " active" : ""}`}
          onClick={() => onWeekChange(weekId)}
          key={weekId}
        >
          {weeks[weekId]?.label || `Week ${weekId}`}
        </button>
      ))}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * AppCard component for Top Apps.
 * Displays app info, visit link, and list of voters (usernames) who voted for the app.
 */
function AppCard({ app }) {
  return (
    <div className="topapp-card">
      <div className="topapp-img-wrap">
        <img src={app.image_url} alt={app.app_name} className="topapp-img" />
      </div>
      <div className="topapp-card-content">
        <div className="topapp-title">{app.app_name}</div>
        <div className="topapp-action-row">
          <a
            href={app.app_link}
            target="_blank"
            rel="noopener noreferrer"
            className="visit-btn"
          >
            Visit App
          </a>
        </div>
        {/* Display voter usernames */}
        {Array.isArray(app.voters) && app.voters.length > 0 ? (
          <div className="votes-chip" title="Voters">
            <span style={{ fontWeight: 500, color: "#1976D2" }}>Voted by:</span>
            <ul style={{ margin: "0.5em 0 0 0", padding: 0, listStyle: "none", fontSize: 15 }}>
              {app.voters.map((voter, i) => (
                <li
                  key={i}
                  style={{
                    background: "#e8f4fd",
                    borderRadius: "12px",
                    padding: "2px 10px",
                    display: "inline-block",
                    margin: "2px 4px 2px 0"
                  }}
                >
                  {voter}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="votes-chip" title="Voters" style={{ color: "#888" }}>
            No votes yet
          </div>
        )}
      </div>
    </div>
  );
}

export default function TopAppsPage() {
  // --- Insert demo logic for voter lists (in real app, this would come from backend) ---
  // We'll generate a fake voter list for each app based on the vote count
  const entries = Array.isArray(appData) ? appData.map(app => {
    // Only add voters if not already present (prevents double-adding if hot-reload in dev)
    if (!app.voters) {
      // For demo, mock some names. Ideally, load real usernames from API/backend
      const sampleUsernames = [
        "Arun", "Bhavya", "Charan", "Disha", "Eshan", "Fatima", "Gaurav", "Hari",
        "Imran", "Jeni", "Kiran", "Lavanya", "Manju", "Nisha", "Om", "Pooja",
        "Qadir", "Riya", "Suman", "Tanvi", "Utkarsh", "Vani", "Wasim", "Xena",
        "Yash", "Zoya"
      ];
      // If app.vote_count == 0, leave as empty array
      const numVoters = Number(app.vote_count ?? app.votes ?? 0);
      app.voters = numVoters
        ? Array.from({length: numVoters}, (_, i) => sampleUsernames[i % sampleUsernames.length] + (numVoters > sampleUsernames.length ? ` #${i+1}` : ""))
        : [];
    }
    return app;
  }) : [];
  // --- END demo logic for voter lists ---

  const byWeek = groupByWeek(entries);

  const weekIds = Object.keys(byWeek)
    .filter((k) => k && !isNaN(Number(k)))
    .sort((a, b) => Number(a) - Number(b));
  if (weekIds.length === 0 && Object.keys(byWeek).length > 0) {
    weekIds.push(...Object.keys(byWeek));
  }
  // UI state: active tab/week
  const [selectedWeek, setSelectedWeek] = useState(weekIds[0] || "all");

  // Data selection
  let gridSets;
  if (selectedWeek === "all") {
    gridSets = weekIds.map((weekId) => ({
      key: weekId,
      title: byWeek[weekId]?.label ?? `Week ${weekId}`,
      apps: getSortedTopApps((byWeek[weekId]?.entries) || []),
    }));
  } else {
    gridSets = [
      {
        key: selectedWeek,
        title: byWeek[selectedWeek]?.label ?? `Week ${selectedWeek}`,
        apps: getSortedTopApps((byWeek[selectedWeek]?.entries) || []),
      },
    ];
  }

  return (
    <div className="topapps-root" style={{ background: COLORS.secondary, minHeight: "100vh" }}>
      <h2 className="topapps-header">Top 10 Apps per Week</h2>
      <WeekTabs
        weekIds={weekIds}
        weeks={byWeek}
        activeWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
      />
      {gridSets.map((grid) => (
        <div className="topapps-section" key={grid.key}>
          <h3 className="topapps-week-title">{grid.title}</h3>
          <div className="topapps-card-grid">
            {grid.apps.length === 0 ? (
              <div style={{ color: COLORS.text, fontSize: 18, margin: 32 }}>
                No apps found for this week.
              </div>
            ) : (
              grid.apps.map((app) => <AppCard app={app} key={app.app_id} />)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
