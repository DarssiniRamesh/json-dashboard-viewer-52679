import React from "react";

function applyFilters(votes, filters) {
  return votes.filter((v) => {
    if (filters.week && filters.week !== "All" && v.week !== filters.week) return false;
    if (filters.platform && filters.platform !== "All" && v.platform !== filters.platform) return false;
    return true;
  });
}

// PUBLIC_INTERFACE
export function WordCloudWidget({ data, filters }) {
  if (!data || !data.votes) return null;
  const filteredVotes = applyFilters(data.votes, filters);
  const allFeatures = filteredVotes.flatMap((v) => v.features || []);
  const freq = {};
  allFeatures.forEach((f) => {
    freq[f] = (freq[f] || 0) + 1;
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 24);

  return (
    <div className="dashboard-widget">
      <div className="widget-title">Popular Features (Word Cloud)</div>
      <div className="word-cloud">
        {sorted.length === 0 ? (
          <span style={{ color: "#738aba" }}>No features</span>
        ) : (
          sorted.map(([word, count], i) => (
            <span key={word} className={`word-cloud-item${i < 4 ? " important" : ""}`}>
              {word} <sub>({count})</sub>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
