import React, { useState, useMemo } from "react";
import "./WordCloudPage.css";
import appJson from "./app.json";

/**
 * For each app, extract the relevant keywords for integrations and features,
 * giving preference to those in the weekly top 10 by vote_count.
 * Uses multiple fields, boosts top apps' keywords, and merges/normalizes them.
 */

// Utility: week key from date string (YYYY-WW)
function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const oneJan = new Date(d.getFullYear(), 0, 1);
  // Day of year
  const dayOfYear =
    Math.floor((d - oneJan) / (24 * 60 * 60 * 1000)) + 1;
  // Week number
  const week = Math.ceil((dayOfYear + oneJan.getDay()) / 7);
  return `${d.getFullYear()}-${week.toString().padStart(2, "0")}`;
}

// Find top 10 apps by vote_count per week
function getTopAppIdsByWeek(apps) {
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
  // Flatten to set
  const allTop = new Set();
  Object.values(weeks).forEach((x) => x.forEach((id) => allTop.add(id)));
  return allTop;
}

// Extracts keywords for integrations (or features or other fields)
function extractKeywords(app, type) {
  if (type === "integrations") {
    // Combine potential integration sources
    let kws = [
      ...(Array.isArray(app.integrations) ? app.integrations : []),
      ...(Array.isArray(app.api_integrations) ? app.api_integrations : []),
      ...(Array.isArray(app.oauth_services) ? app.oauth_services : []),
    ];
    // If some are comma-separated string lists, split
    return kws.flatMap((k) =>
      typeof k === "string" && k.includes(",")
        ? k.split(",").map((x) => x.trim()).filter(Boolean)
        : [k].filter(Boolean)
    );
  }
  if (type === "features") {
    let kws = [
      ...(Array.isArray(app.features) ? app.features : []),
      ...(Array.isArray(app.capabilities) ? app.capabilities : []),
      ...(Array.isArray(app.unique_points) ? app.unique_points : []),
    ];
    // Optionally extract notable phrases from description
    if (typeof app.description === "string" && app.description.length > 0) {
      const descPhrases = app.description
        .split(/[.,;]+/)
        .map((s) => s.trim())
        .filter((s) => s.split(" ").length >= 3 && s.split(" ").length <= 6);
      kws.push(...descPhrases);
    }
    return kws.flatMap((k) =>
      typeof k === "string" && k.includes(",")
        ? k.split(",").map((x) => x.trim()).filter(Boolean)
        : [k].filter(Boolean)
    );
  }
  return [];
}

function aggregateAndWeightKeywords(apps, type, topAppIds) {
  const freq = {};
  apps.forEach((app) => {
    const kws = extractKeywords(app, type);
    const isTop = topAppIds.has(app.id);
    kws.forEach((k) => {
      if (!k) return;
      const norm = k.trim().toLowerCase();
      // Boost presence in top weekly apps
      const boost = isTop ? 5 : 1;
      if (!freq[norm]) freq[norm] = { text: k.trim(), value: 0 };
      freq[norm].value += boost;
    });
  });
  // Return as array of {text, value}
  return Object.values(freq);
}

// Fallback static (if no real data)
const fallback = {
  integrations: [
    { text: "Supabase", value: 18 },
    { text: "AWS", value: 13 },
    { text: "Stripe", value: 11 },
    { text: "Twilio", value: 7 },
    { text: "OAuth", value: 10 },
    { text: "OpenAI", value: 9 },
    { text: "Google", value: 6 },
  ],
  features: [
    { text: "AI-powered", value: 17 },
    { text: "Real-time Sync", value: 11 },
    { text: "API-first", value: 9 },
    { text: "Custom Widgets", value: 12 },
    { text: "Mobile Responsive", value: 10 },
    { text: "Dark Mode", value: 7 },
    { text: "Internationalization", value: 6 },
  ],
  challenges: [
    { text: "Rate limits and quotas", value: 20 },
    { text: "Vendor lock-in risk", value: 14 },
    { text: "Async data race conditions", value: 16 },
    { text: "Third-party API instability", value: 13 },
    { text: "UI performance tuning", value: 15 },
    { text: "Security compliance overhead", value: 16 },
    { text: "Integration test complexity", value: 11 },
  ]
};

/**
 * PUBLIC_INTERFACE
 * WordCloudPage: A page with tabs for 'integrations', 'features', and 'challenges'.
 * Displays a list of words/phrases and their weights as a placeholder for a word cloud.
 * All references to 'react-wordcloud' have been removed for React 18 compatibility.
 */
function WordCloudPage() {
  const [tab, setTab] = useState("integrations");

  // Compute words/phrases based on tab and data
  const words = useMemo(() => {
    // If visualizations exist in static JSON (legacy schema), use that.
    if (
      appJson &&
      appJson.visualizations &&
      typeof appJson.visualizations === "object"
    ) {
      if (tab === "integrations" && appJson.visualizations.integrations) {
        return appJson.visualizations.integrations.map((item) => ({
          text: item.word ?? item.text,
          value: item.freq ?? item.value ?? 1,
        }));
      }
      if (tab === "features" && appJson.visualizations.features) {
        return appJson.visualizations.features.map((item) => ({
          text: item.word ?? item.text,
          value: item.freq ?? item.value ?? 1,
        }));
      }
      if (tab === "challenges" && appJson.visualizations.challenges) {
        return appJson.visualizations.challenges.map((sent) => ({
          text: sent,
          value: 10 + (sent.length % 10),
        }));
      }
    }
    // If there is app-level data (array of apps)
    if (Array.isArray(appJson)) {
      // Aggregate and boost for top apps on integrations/features
      const topIds = getTopAppIdsByWeek(appJson);
      if (tab === "integrations") {
        const arr = aggregateAndWeightKeywords(
          appJson,
          "integrations",
          topIds
        );
        return arr.length > 0 ? arr : fallback.integrations;
      }
      if (tab === "features") {
        const arr = aggregateAndWeightKeywords(
          appJson,
          "features",
          topIds
        );
        return arr.length > 0 ? arr : fallback.features;
      }
      if (tab === "challenges") {
        return fallback.challenges;
      }
    }
    // Fallback
    if (tab === "integrations") return fallback.integrations;
    if (tab === "features") return fallback.features;
    if (tab === "challenges") return fallback.challenges;
    return [];
  }, [tab, appJson]);

  return (
    <div className="wordcloud-page">
      <h2>Project Word &amp; Sentence Clouds</h2>
      <div className="tabs">
        <button
          className={tab === "integrations" ? "active" : ""}
          onClick={() => setTab("integrations")}
        >
          Third-party Integrations
        </button>
        <button
          className={tab === "features" ? "active" : ""}
          onClick={() => setTab("features")}
        >
          Unique Features
        </button>
        <button
          className={tab === "challenges" ? "active" : ""}
          onClick={() => setTab("challenges")}
        >
          Challenges Faced
        </button>
      </div>
      <div className="cloud-container">
        {/* Placeholder for the word cloud using a stylized list */}
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
                    color: tab === "challenges" ? "#1976D2" : "#00897B",
                    margin: "4px 0",
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
