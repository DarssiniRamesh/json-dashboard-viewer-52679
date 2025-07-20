import React from "react";

// Returns votes filtered by filters
function applyFilters(votes, filters) {
  return votes.filter((v) => {
    if (filters.week && filters.week !== "All" && v.week !== filters.week) return false;
    if (filters.platform && filters.platform !== "All" && v.platform !== filters.platform) return false;
    return true;
  });
}

/**
 * PUBLIC_INTERFACE
 * TopAppsWidget: Displays the top-voted apps, clickable with image, name, and vote count.
 */
export function TopAppsWidget({ data, filters }) {
  if (!data || !data.votes) return null;
  const filteredVotes = applyFilters(data.votes, filters);

  // Tally by app (voteCount comes from raw count, not from # of records)
  // Use unique app IDs for accuracy and sum voteCount
  const appMap = {};
  filteredVotes.forEach((v) => {
    if (!appMap[v.appId]) {
      appMap[v.appId] = {
        appName: v.appName,
        imageUrl: v.appImage,
        link: v.appLink,
        description: v.appDescription,
        votes: 0,
      };
    }
    appMap[v.appId].votes = (appMap[v.appId].votes || 0) + (v.voteCount || 0);
  });

  // Convert and sort by total votes
  const sorted = Object.values(appMap)
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  return (
    <div className="dashboard-widget highlighted" id="top-apps">
      <div className="widget-title">🏆 Top Voted Apps</div>
      <div className="top-apps-list">
        {sorted.length === 0 ? (
          <div style={{ color: "#86a6bc", fontStyle: "italic" }}>No data</div>
        ) : (
          sorted.map((app, i) => (
            <a
              key={app.appName}
              className={`top-app-card rank-${i + 1}`}
              title={app.appName}
              href={app.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "inherit" }}
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
              <div className="app-meta">
                {app.votes} vote{app.votes === 1 ? "" : "s"}
              </div>
              {app.description && (
                <div className="app-description">{app.description}</div>
              )}
            </a>
          ))
        )}
      </div>
    </div>
  );
}
