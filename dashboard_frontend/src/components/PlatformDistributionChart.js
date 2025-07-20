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
export function PlatformDistributionChart({ data, filters }) {
  if (!data || !data.votes) return null;
  const filteredVotes = applyFilters(data.votes, filters);

  const platformCounts = {};
  filteredVotes.forEach((v) => {
    platformCounts[v.platform] = (platformCounts[v.platform] || 0) + 1;
  });

  const total = filteredVotes.length;

  return (
    <div className="dashboard-widget">
      <div className="widget-title">Platform Distribution</div>
      {Object.keys(platformCounts).length === 0 ? (
        <span style={{ fontStyle: "italic", color: "#86a6bc" }}>No data</span>
      ) : (
        <div className="chart-container" style={{ minHeight: 40 }}>
          {Object.entries(platformCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([plat, count]) => (
              <div
                key={plat}
                style={{
                  marginBottom: 8,
                  background: "#ddefff",
                  borderRadius: 7,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "#1976d2",
                    position: "absolute",
                    left: 9,
                    top: 6,
                  }}
                >
                  {plat}
                </span>
                <span
                  style={{
                    display: "inline-block",
                    background: "#1976d2",
                    height: 28,
                    borderRadius: 7,
                    width: `${(count / total) * 86 + 7}%`,
                    minWidth: 38,
                    color: "#fff",
                    textAlign: "center",
                    lineHeight: "28px",
                    fontWeight: 500,
                    marginLeft: 70,
                    paddingLeft: 7,
                  }}
                  title={`Count: ${count}`}
                >
                  {count}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
