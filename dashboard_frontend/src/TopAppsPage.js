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
          <div className="votes-chip" title="Votes">{app.vote_count ?? app.votes ?? 0} votes</div>
        </div>
      </div>
    </div>
  );
}

export default function TopAppsPage() {
  const entries = Array.isArray(appData) ? appData : [];
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
