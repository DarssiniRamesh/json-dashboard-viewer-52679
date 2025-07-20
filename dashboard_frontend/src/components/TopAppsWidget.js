import React from "react";

// Returns votes filtered by filters
function applyFilters(votes, filters) {
  return votes.filter((v) => {
    if (filters.week && filters.week !== "All" && v.week !== filters.week) return false;
    if (filters.platform && filters.platform !== "All" && v.platform !== filters.platform) return false;
    return true;
  });
}

// PUBLIC_INTERFACE
export function TopAppsWidget({ data, filters }) {
  if (!data || !data.votes) return null;
  const filteredVotes = applyFilters(data.votes, filters);

  // Tally voted apps with totals and average NPS
  const appCounts = {};
  filteredVotes.forEach((v) => {
    if (!appCounts[v.appName]) {
      appCounts[v.appName] = {
        votes: 0,
        imageUrl: v.appImage || "",
        link: v.appLink || "",
        npsSum: 0,
        npsCount: 0,
        description: v.appDescription || "",
      };
    }
    appCounts[v.appName].votes += 1;
    if (typeof v.npsScore === "number") {
      appCounts[v.appName].npsSum += v.npsScore;
      appCounts[v.appName].npsCount += 1;
    }
  });

  // Sort by votes descending, then NPS descending
  const sorted = Object.entries(appCounts)
    .map(([name, stats]) => ({
      ...stats,
      appName: name,
      avgNps:
        stats.npsCount > 0
          ? Math.round((stats.npsSum / stats.npsCount) * 10) / 10
          : "-",
    }))
    .sort((a, b) =>
      b.votes !== a.votes
        ? b.votes - a.votes
        : (b.avgNps || 0) - (a.avgNps || 0)
    );

  const top = sorted.slice(0, 3);

  return (
    <div className="dashboard-widget highlighted" id="top-apps">
      <div className="widget-title">🏆 Top Voted Apps</div>
      <div className="top-apps-list">
        {top.length === 0 ? (
          <div style={{ color: "#86a6bc", fontStyle: "italic" }}>No data</div>
        ) : (
          top.map((app, i) => (
            <div
              key={app.appName}
              className={`top-app-card rank-${i + 1}`}
              title={app.appName}
            >
              {app.imageUrl && (
                <img
                  className="app-image"
                  src={app.imageUrl}
                  alt={app.appName}
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
              <div className="app-title">{app.appName}</div>
              {app.link && (
                <a
                  className="app-link"
                  href={app.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit App ↗
                </a>
              )}
              <div className="app-meta">
                {app.votes} votes · NPS: {app.avgNps}
              </div>
              {app.description && (
                <div className="app-description">{app.description}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
