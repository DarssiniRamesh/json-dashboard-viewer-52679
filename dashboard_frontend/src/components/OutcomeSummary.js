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
export function OutcomeSummary({ data, filters }) {
  if (!data || !data.votes) return null;
  const filteredVotes = applyFilters(data.votes, filters);

  // Simple logic: which app "won" most often per week, and notable trends in feedback
  const weekLeaders = {};
  filteredVotes.forEach((v) => {
    if (!weekLeaders[v.week]) weekLeaders[v.week] = {};
    if (!weekLeaders[v.week][v.appName]) weekLeaders[v.week][v.appName] = 0;
    weekLeaders[v.week][v.appName] += 1;
  });
  // For each week, find top app
  const weekWinners = Object.fromEntries(
    Object.entries(weekLeaders).map(([week, tally]) => [
      week,
      Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0],
    ])
  );

  // Collect feedback sentences, summary
  const comments = filteredVotes.flatMap((v) => v.generalComments || []);
  const summaryText =
    comments.length > 5
      ? "Most praised: " +
        extractHighlights(comments, true) +
        ". Some key improvement wishes: " +
        extractHighlights(comments, false)
      : "Feedback varied. See feature/word clouds.";

  return (
    <div className="dashboard-widget" id="analytics">
      <div className="widget-title">Outcome Summary & Insights</div>
      <div>
        <b>Most-voted App per Week:</b>
        <ul>
          {Object.entries(weekWinners).map(([week, winner]) => (
            <li key={week}>
              {week}: <span style={{ color: "#1976d2"}}>{winner}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <b>Highlights:</b>
        <div style={{ color: "#385080", margin: "6px 0" }}>{summaryText}</div>
      </div>
    </div>
  );
}

// Finds the most common sentence fragments in comments, skipping PII
function extractHighlights(comments, positive = true) {
  // Do simple score: words like good/cool/best/awesome are positive, words like bug/slow/problem/boring are negative
  const posWords = [
    "love",
    "like",
    "best",
    "awesome",
    "cool",
    "great",
    "helpful",
    "easy",
    "fun",
    "nice",
    "smooth",
    "fast",
  ];
  const negWords = [
    "wish",
    "missing",
    "bug",
    "slow",
    "problem",
    "bad",
    "boring",
    "confusing",
    "difficult",
    "pain",
    "hate",
  ];
  const scores = {};
  comments.forEach((comment) => {
    const text = comment.toLowerCase();
    posWords.forEach((w) => {
      if (positive && text.includes(w))
        scores[w] = (scores[w] || 0) + 1;
    });
    negWords.forEach((w) => {
      if (!positive && text.includes(w))
        scores[w] = (scores[w] || 0) + 1;
    });
  });
  if (Object.keys(scores).length === 0) return "(no major trends)";
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([w, n]) => `${w} (${n})`)
    .slice(0, 3)
    .join(", ");
}
