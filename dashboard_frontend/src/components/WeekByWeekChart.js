import React from "react";

function applyFilters(votes, filters) {
  return votes.filter((v) => {
    if (filters.week && filters.week !== "All" && v.week !== filters.week) return false;
    if (filters.platform && filters.platform !== "All" && v.platform !== filters.platform) return false;
    return true;
  });
}

// PUBLIC_INTERFACE
export function WeekByWeekChart({ data, filters }) {
  if (!data || !data.votes) return null;
  const filteredVotes = applyFilters(data.votes, filters);

  // Collect submissions and nps by week
  const weekMap = {};
  filteredVotes.forEach((v) => {
    if (!weekMap[v.week]) weekMap[v.week] = { count: 0, npsSum: 0, npsCount: 0 };
    weekMap[v.week].count += 1;
    if (typeof v.npsScore === "number") {
      weekMap[v.week].npsSum += v.npsScore;
      weekMap[v.week].npsCount += 1;
    }
  });
  const weeks = Object.keys(weekMap).sort();
  const counts = weeks.map((w) => weekMap[w].count);
  const nps = weeks.map((w) =>
    weekMap[w].npsCount
      ? Math.round(
          ((weekMap[w].npsSum / weekMap[w].npsCount - 6) / 4) * 100
        )
      : 0
  ); // (NPS formula, mapped to [-100, 100])

  // Simple bar chart, no external dependencies used!
  const maxVotes = Math.max(...counts, 1);

  return (
    <div className="dashboard-widget">
      <div className="widget-title">Week-by-Week Analysis</div>
      {weeks.length === 0 ? (
        <span style={{ color: "#86a6bc" }}>No data</span>
      ) : (
        <div className="chart-container" style={{ minHeight: 60, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-end", height: 66 }}>
            {weeks.map((week, idx) => (
              <div
                key={week}
                style={{
                  flex: 1,
                  margin: "0 7px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: 50,
                }}
              >
                <div
                  style={{
                    height: `${Math.max(14, (counts[idx] / maxVotes) * 54)}px`,
                    background: "#1976d2",
                    borderRadius: 7,
                    width: "25px",
                    marginBottom: "5px",
                    transition: "height 0.2s",
                  }}
                  title={`Submissions: ${counts[idx]}`}
                ></div>
                <div
                  style={{
                    color: "#1976d2",
                    fontSize: "0.98rem",
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                >
                  {counts[idx]}
                </div>
                <div
                  style={{
                    color: "#4568aa",
                    fontSize: "0.9rem",
                  }}
                >
                  {week}
                </div>
                <div
                  style={{
                    color: "#ec9807",
                    fontSize: "0.89rem",
                    marginTop: 2,
                  }}
                  title={`Week NPS: ${nps[idx]}`}
                >
                  NPS: {nps[idx]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
