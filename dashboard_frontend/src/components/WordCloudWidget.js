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

  // Robustly extract features/keywords from multiple fields
  const allFeatures = filteredVotes.flatMap((v) => {
    // Prioritize features/unique_features first
    let found = [];
    if (Array.isArray(v.features) && v.features.length) found = v.features;
    else if (typeof v.feature_list === "string" && v.feature_list.trim().length > 2) {
      found = v.feature_list.split(/[,\\n]/).map(s=>s.trim());
    } else if (typeof v.unique_features === "string" && v.unique_features.trim().length > 2) {
      found = v.unique_features.split(/[,\\n\\.]/).map(s=>s.trim()).filter(Boolean);
    }
    // If still empty, try to extract 2- or 3-word phrases from description field
    if ((!found || found.length === 0) && v.appDescription) {
      // Extract noun-phrase-like chunks: 2-5 word sliding windows
      const words = v.appDescription.split(/\\s+/).filter(Boolean);
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = words.slice(i, i + 3).join(" ");
        if (phrase.length > 8 && phrase.length < 30) found.push(phrase);
      }
    }
    // Fallback: split app name into 2-word phrases if very little data
    if ((!found || found.length === 0) && typeof v.appName === "string") {
      const words = v.appName.trim().split(/\\s+/);
      for (let i = 0; i < words.length - 1; i++) {
        found.push(words.slice(i, i + 2).join(" "));
      }
    }
    return found;
  });

  const freq = {};
  allFeatures.forEach((f) => {
    if (!f) return;
    freq[f] = (freq[f] || 0) + 1;
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 24);

  return (
    <div className="dashboard-widget">
      <div className="widget-title">Popular Features <span role="img" aria-label="Word Cloud">☁️</span></div>
      <div className="word-cloud">
        {sorted.length === 0 ? (
          <span style={{ color: "#738aba" }}>No features available – extracted from all app details.</span>
        ) : (
          sorted.map(([word, count], i) => (
            <span
              key={word}
              className={`word-cloud-item${i < 4 ? " important" : ""}`}
              style={{
                fontWeight: i < 4 ? 600 : (200 + 75 * (24 - i) / 24),
                color: i === 0 ? "#1976d2" : i < 4 ? "#385080" : "#364b61",
                fontSize: `${1 + Math.max(0, 0.3 - i * 0.012)}rem`,
                margin: "7px"
              }}
              title={`Mentioned ${count} times`}
            >
              {word} <sub>({count})</sub>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
