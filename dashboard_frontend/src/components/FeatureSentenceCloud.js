import React from "react";

function applyFilters(votes, filters) {
  return votes.filter((v) => {
    if (filters.week && filters.week !== "All" && v.week !== filters.week) return false;
    if (filters.platform && filters.platform !== "All" && v.platform !== filters.platform) return false;
    return true;
  });
}

/**
 * PUBLIC_INTERFACE
 * FeatureSentenceCloud: Renders a \"sentence cloud\" of feature requests or highlight phrases, extracted robustly from all fields.
 */
export function FeatureSentenceCloud({ data, filters }) {
  if (!data || !data.votes) return null;
  const filteredVotes = applyFilters(data.votes, filters);

  // Aggregate sentences from featureRequests, unique_features, and description fields
  let allSentences = filteredVotes.flatMap((v) => {
    let sentences = [];
    if (Array.isArray(v.featureRequests) && v.featureRequests.length) sentences = v.featureRequests;
    // Try unique_features field for more
    else if (typeof v.unique_features === "string" && v.unique_features.trim().length > 4)
      sentences = v.unique_features.split(/[\\n\\.]/).map(s => s.trim()).filter(s => s.length > 12 && !/^[0-9A-Za-z\\-_. ]+$/.test(s));
    // Try to extract a couple of full sentences from appDescription or challenges_faced
    else if (v.appDescription && v.appDescription.length > 16) {
      const text = v.appDescription;
      const re = /([A-Z][^.!?]*[.!?])/g;
      const matches = text.match(re) || [];
      sentences = matches.map(s => s.trim()).filter(x => x.length > 14 && x.split(" ").length > 5);
    }
    // Try challenges_faced
    else if (typeof v.challenges_faced === "string" && v.challenges_faced.length > 15) {
      sentences = v.challenges_faced.split(/[.!?\\n]+/).map(s => s.trim()).filter(s => s.length > 15);
    }
    return sentences;
  });

  // Remove duplicates, filter empty/PII
  const unique = Array.from(new Set(allSentences.filter(s => !!s && !/^([A-Za-z0-9 ]+:?)+$/.test(s))));
  return (
    <div className="dashboard-widget">
      <div className="widget-title">Feature/Suggestion Spotlights <span role="img" aria-label="Sentence Cloud">💬</span></div>
      <div className="word-cloud">
        {unique.length === 0 ? (
          <span style={{ color: "#738aba" }}>No requests found – highlights extracted from all app metadata.</span>
        ) : (
          unique.map((s, i) => (
            <span
              key={i}
              className="word-cloud-item"
              style={{
                fontSize: `${1.09 + (s.length < 38 ? 0.15 : 0) + (s.length > 85 ? -0.10 : 0)}rem`,
                opacity: 0.97 - 0.013 * i,
                margin: "8px 0.5rem 4px 0"
              }}
              title={s.length > 30 ? s : undefined}
            >
              {s}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
