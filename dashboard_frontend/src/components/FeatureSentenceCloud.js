import React from "react";

function applyFilters(votes, filters) {
  return votes.filter((v) => {
    if (filters.week && filters.week !== "All" && v.week !== filters.week) return false;
    if (filters.platform && filters.platform !== "All" && v.platform !== filters.platform) return false;
    return true;
  });
}

// PUBLIC_INTERFACE
export function FeatureSentenceCloud({ data, filters }) {
  if (!data || !data.votes) return null;
  const filteredVotes = applyFilters(data.votes, filters);

  // Aggregate sentences (feature-specific only, omit PII/IDs)
  const allSentences = filteredVotes.flatMap((v) =>
    Array.isArray(v.featureRequests) ? v.featureRequests : []
  );
  // Deduplicate
  const unique = Array.from(new Set(allSentences));
  return (
    <div className="dashboard-widget">
      <div className="widget-title">Feature Requests (Sentence Cloud)</div>
      <div className="word-cloud">
        {unique.length === 0 ? (
          <span style={{ color: "#738aba" }}>No requests</span>
        ) : (
          unique.map((s, i) => (
            <span key={i} className="word-cloud-item" style={{ fontSize: `${1 + (s.length < 38 ? 0.13 : 0) + (s.length > 80 ? -0.10 : 0)}rem` }}>
              {s}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
