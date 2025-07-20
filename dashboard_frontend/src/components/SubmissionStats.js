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
export function SubmissionStats({ data, filters }) {
  if (!data || !data.votes) return null;
  const filteredVotes = applyFilters(data.votes, filters);

  // Week tally
  const weekCounts = {};
  filteredVotes.forEach((v) => {
    weekCounts[v.week] = (weekCounts[v.week] || 0) + 1;
  });

  // Platform tally
  const platformCounts = {};
  filteredVotes.forEach((v) => {
    platformCounts[v.platform] = (platformCounts[v.platform] || 0) + 1;
  });

  return (
    <div className="dashboard-widget">
      <div className="widget-title">Vote Tally</div>
      <div style={{ marginBottom: 11 }}>Submissions by Week:</div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 7 }}>
        {Object.keys(weekCounts).sort().map((week) => (
          <span key={week} style={{
            background: '#e7f0fb', color: '#1976d2', padding: '5px 9px', borderRadius: '12px', marginRight: 3, fontSize:14
          }}>
            {week}: {weekCounts[week]}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 13, marginBottom: 4 }}>Submissions by Platform:</div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 7 }}>
        {Object.keys(platformCounts).sort().map((plat) => (
          <span key={plat} style={{
            background: '#e7f8f7', color: '#1976d2', padding: '5px 9px', borderRadius: '12px', marginRight: 3, fontSize:14
          }}>
            {plat}: {platformCounts[plat]}
          </span>
        ))}
      </div>
    </div>
  );
}
