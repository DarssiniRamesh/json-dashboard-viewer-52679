import React, { useState } from "react";
import appData from "./app.json";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * Top 10 Apps per Week Page - Responsive grid with 5 cards per row.
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

// PUBLIC_INTERFACE
function AppCard({ app }) {
  return (
    <div
      className="topapp-card"
      style={{
        background: COLORS.white,
        borderRadius: 16,
        padding: "20px 14px 20px 14px",
        boxShadow: "0 2px 9px rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: 210,
        height: "100%",
        maxWidth: 290,
        justifyContent: "flex-start",
      }}
    >
      <div className="topapp-img-wrap" style={{ marginBottom: 10 }}>
        <img
          src={app.image_url}
          alt={app.app_name}
          className="topapp-img"
          style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover", display: "block" }}
        />
      </div>
      <div
        className="topapp-card-content"
        style={{
          width: "100%",
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          className="topapp-title"
          title={app.app_name}
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: COLORS.text,
            marginBottom: 7,
            textAlign: "center",
            width: "100%",
            whiteSpace: "normal",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            lineHeight: 1.25,
            padding: "0 8px",
            maxHeight: 44,
            overflowY: "auto",
          }}
        >
          {app.app_name}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#757575",
            marginBottom: 4,
            textAlign: "center",
            minHeight: 18,
            lineHeight: "18px",
            padding: "0 6px",
            width: "100%",
            wordBreak: "break-word",
          }}
        >
          {app.subtitle}
        </div>
        <div className="topapp-action-row" style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "row",
          gap: 10,
          justifyContent: "center",
          alignItems: "center",
          width: "100%"
        }}>
          <a
            href={app.app_link}
            target="_blank"
            rel="noopener noreferrer"
            className="visit-btn"
            style={{
              background: COLORS.primary,
              color: COLORS.white,
              padding: "6px 17px",
              borderRadius: "999px",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: 14,
              transition: "background 0.2s",
              marginRight: 4,
              whiteSpace: "nowrap"
            }}
          >
            Visit App
          </a>
          <div
            className="creator-chip"
            title="Created by"
            style={{
              background: "#E0F7FA",
              color: "#008080",
              borderRadius: "999px",
              padding: "3px 12px",
              fontSize: "0.97em",
              fontWeight: 500,
              alignSelf: "center",
              marginLeft: 0
            }}
          >
            {app.username ? `By ${app.username}` : "Creator Unknown"}
          </div>
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

  // Responsive CSS for 5 columns at desktop, less for smaller sizes
  // These styles ensure exactly 5 cards per row at >=1280px width
  return (
    <div className="topapps-root" style={{ background: COLORS.secondary, minHeight: "100vh" }}>
      <h2 className="topapps-header">Top 10 Apps per Week</h2>
      {/* Responsive grid CSS injected here */}
      <style>
        {`
        .topapps-card-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
          margin: 2.3rem 0 1rem 0;
        }
        @media (max-width: 1280px) {
          .topapps-card-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        @media (max-width: 950px) {
          .topapps-card-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 700px) {
          .topapps-card-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 470px) {
          .topapps-card-grid {
            grid-template-columns: 1fr;
          }
        }
        `}
      </style>
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
