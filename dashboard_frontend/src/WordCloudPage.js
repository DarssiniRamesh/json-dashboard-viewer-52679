import React, { useState, useMemo } from "react";
import "./WordCloudPage.css";
import appJson from "./app.json";

/**
 * Tab definitions for the Word Cloud page.
 * Each tab uses ONLY its defined field for keyword extraction.
 */
const TAB_DEFS = [
  {
    label: "Third-party Integrations",
    value: "integrations",
    field: "third_party_integrations",
    color: "#00897B"
  },
  {
    label: "Unique Features",
    value: "features",
    field: "unique_features",
    color: "#00897B"
  },
  {
    label: "Challenges Faced",
    value: "challenges",
    field: "challenges_faced",
    color: "#1976D2"
  }
];

/**
 * PUBLIC_INTERFACE
 * Extracts array of keyword strings from the designated field of an app object.
 * Splits comma- or newline-separated strings if found.
 * Returns a flat array of strings; empty array if field missing or empty.
 */
function extractFieldWords(app, field) {
  const val = app[field];
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.flatMap((item) =>
      typeof item === "string"
        ? item.split(/[,|;\n]+/).map((w) => w.trim()).filter(Boolean)
        : []
    );
  }
  if (typeof val === "string") {
    return val.split(/[,|;\n]+/).map((w) => w.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Returns weighted list of word cloud entries [{text, value}] for the given field.
 * Boosts words from top weekly apps by vote_count.
 */
function aggregateAndWeightField(apps, field, topAppIds) {
  const freq = {};
  apps.forEach((app) => {
    const words = extractFieldWords(app, field);
    const isTop = topAppIds.has(app.id);
    words.forEach((w) => {
      if (!w) return;
      const norm = w.trim().toLowerCase();
      const boost = isTop ? 5 : 1;
      if (!freq[norm]) freq[norm] = { text: w.trim(), value: 0 };
      freq[norm].value += boost;
    });
  });
  return Object.values(freq);
}

/**
 * Utility: get set of all app ids in the top 10 by vote_count, per week.
 */
function getTopAppIdsByWeek(apps) {
  // Week key: YYYY-WW
  function getWeekKey(dateStr) {
    const d = new Date(dateStr);
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000)) + 1;
    const week = Math.ceil((dayOfYear + oneJan.getDay()) / 7);
    return `${d.getFullYear()}-${week.toString().padStart(2, "0")}`;
  }
  const weeks = {};
  apps.forEach((app) => {
    if (!app.created_at || typeof app.vote_count !== "number") return;
    const wk = getWeekKey(app.created_at);
    if (!weeks[wk]) weeks[wk] = [];
    weeks[wk].push(app);
  });
  Object.keys(weeks).forEach((wk) => {
    weeks[wk].sort((a, b) => b.vote_count - a.vote_count);
    weeks[wk] = weeks[wk].slice(0, 10).map((a) => a.id);
  });
  // Flatten into a single set
  const allTop = new Set();
  Object.values(weeks).forEach((ids) => ids.forEach((id) => allTop.add(id)));
  return allTop;
}

// Fallback static word clouds for each tab
const fallback = {
  integrations: [
    { text: "Supabase", value: 18 },
    { text: "AWS", value: 13 },
    { text: "Stripe", value: 11 },
    { text: "Twilio", value: 7 },
    { text: "OAuth", value: 10 },
    { text: "OpenAI", value: 9 },
    { text: "Google", value: 6 }
  ],
  features: [
    { text: "AI-powered", value: 17 },
    { text: "Real-time Sync", value: 11 },
    { text: "API-first", value: 9 },
    { text: "Custom Widgets", value: 12 },
    { text: "Mobile Responsive", value: 10 },
    { text: "Dark Mode", value: 7 },
    { text: "Internationalization", value: 6 }
  ],
  challenges: [
    { text: "Rate limits and quotas", value: 20 },
    { text: "Vendor lock-in risk", value: 14 },
    { text: "Async data race conditions", value: 16 },
    { text: "Third-party API instability", value: 13 },
    { text: "UI performance tuning", value: 15 },
    { text: "Security compliance overhead", value: 16 },
    { text: "Integration test complexity", value: 11 }
  ]
};

/**
 * PUBLIC_INTERFACE
 * WordCloudPage: shows word/sentence clouds for Integration, Features, and Challenges.
 * Words are extracted using only their specific designated data fields.
 */
function WordCloudPage() {
  const [tabIdx, setTabIdx] = useState(0);
  const tab = TAB_DEFS[tabIdx];

  // Compute words/phrases based strictly on the tab's designated field
  const words = useMemo(() => {
    // Prefer new appJson structure: array of apps
    if (Array.isArray(appJson)) {
      const topIds = getTopAppIdsByWeek(appJson);
      const arr = aggregateAndWeightField(appJson, tab.field, topIds);
      if (!arr || arr.length === 0 || arr.every(w => !w.text || w.text.trim() === "")) {
        return fallback[tab.value];
      }
      return arr;
    }
    // If legacy visualizations exist and match field, use
    if (
      appJson &&
      typeof appJson === "object" &&
      appJson.visualizations &&
      typeof appJson.visualizations === "object" &&
      appJson.visualizations[tab.value]
    ) {
      // Assume [{text, value}] array
      return appJson.visualizations[tab.value].map((item) => ({
        text: item.word ?? item.text,
        value: item.freq ?? item.value ?? 1
      }));
    }
    // Fallback static
    return fallback[tab.value] ?? [];
  }, [tab, appJson]);

  return (
    <div className="wordcloud-page">
      <h2>Project Word &amp; Sentence Clouds</h2>
      <div className="tabs">
        {TAB_DEFS.map((t, idx) => (
          <button
            key={t.value}
            className={tabIdx === idx ? "active" : ""}
            onClick={() => setTabIdx(idx)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="cloud-container">
        {/* Stylized word cloud list */}
        <ul className="wordcloud-list">
          {words && words.length > 0 ? (
            words
              .sort((a, b) => b.value - a.value)
              .map((word, idx) => (
                <li
                  key={idx}
                  style={{
                    fontWeight: "bold",
                    fontSize: `${Math.min(18 + word.value * 2, 48)}px`,
                    color: tab.color,
                    margin: "4px 0"
                  }}
                >
                  {word.text}{" "}
                  <span style={{ color: "#888", fontWeight: 400 }}>
                    ({word.value})
                  </span>
                </li>
              ))
          ) : (
            <li>No data to display.</li>
          )}
        </ul>
      </div>
      <div className="cloud-legend">
        <span>
          <b>Tip:</b> Larger and bolder words/phrases are more prominent, especially if they are from top voted apps each week.
        </span>
      </div>
    </div>
  );
}

export default WordCloudPage;
