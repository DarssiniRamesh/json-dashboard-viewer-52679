import React from "react";

// Utility to filter data by filters object
function applyFilters(votes, filters) {
  return votes.filter((v) => {
    if (filters.week && filters.week !== "All" && v.week !== filters.week) return false;
    if (filters.platform && filters.platform !== "All" && v.platform !== filters.platform) return false;
    return true;
  });
}

// PUBLIC_INTERFACE
export function StatsSummary({ data, filters }) {
  if (!data || !data.votes) return null;
  const filteredVotes = applyFilters(data.votes, filters);

  // Aggregate stats
  const totalSubmissions = filteredVotes.length;
  const uniqueUsers = new Set(filteredVotes.map((v) => v.anonUser)).size;
  const uniqueApps = new Set(filteredVotes.map((v) => v.appName)).size;
  const uniqueFeatures = new Set(
    filteredVotes.flatMap((v) => (v.features || []))
  ).size;

  const npsVotes = filteredVotes.map((v) => v.npsScore).filter((n) => typeof n === "number");
  const promoters = npsVotes.filter((n) => n >= 9).length;
  const detractors = npsVotes.filter((n) => n <= 6).length;
  const passives = npsVotes.filter((n) => n > 6 && n < 9).length;
  const nps = npsVotes.length
    ? Math.round(
        ((promoters - detractors) / npsVotes.length) * 100
      )
    : "-";

  return (
    <div className="dashboard-widget">
      <div className="widget-title">Summary Stats</div>
      <div>
        <span className="widget-value" title="Total submissions">{totalSubmissions}</span>
        <span style={{ marginLeft: 11, color: "#385080"}}>Submissions</span>
      </div>
      <div>
        <span className="widget-value" title="Unique users">{uniqueUsers}</span>
        <span style={{ marginLeft: 11, color: "#385080"}}>Participants</span>
      </div>
      <div>
        <span className="widget-value" title="Unique apps">{uniqueApps}</span>
        <span style={{ marginLeft: 11, color: "#385080"}}>Apps Evaluated</span>
      </div>
      <div>
        <span className="widget-value" title="Unique features">{uniqueFeatures}</span>
        <span style={{ marginLeft: 11, color: "#385080"}}>Features Suggested</span>
      </div>
      <div>
        <span className="widget-value" title="NPS Score">{nps}</span>
        <span style={{ marginLeft: 11, color: "#385080"}}>NPS</span>
      </div>
    </div>
  );
}
