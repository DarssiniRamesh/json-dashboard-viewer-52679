import React, { useState, useMemo } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";
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

// Palette for word cloud
const tealPalette = [
  "#1976D2",
  "#009688",
  "#26C6DA",
  "#43A047",
  "#0288D1",
  "#80CBC4",
  "#00BCD4",
  "#00897B",
  "#00ACC1",
  "#B2EBF2",
  "#62CBC9",
];

const getWordCloudOptions = (tab) => ({
  colors: tealPalette,
  fontFamily: "Poppins, sans-serif",
  fontSizes: [26, 64],
  rotations: 3,
  rotationAngles: [-10, 0, 10],
  scale: "sqrt",
  spiral: "archimedean",
  transitionDuration: 800,
  enableTooltip: true,
  deterministic: false,
  fontStyle: tab === "challenges" ? "italic" : "normal",
  fontWeight: tab === "challenges" ? "normal" : "bold",
});

function WordCloudPage() {
  const [tab, setTab] = useState("integrations");

  // Compute only if tab or appJson changes
  // (moved above to avoid ReferenceError and duplicate declaration)

  // D3-cloud rendering effect
  React.useEffect(() => {
    if (!words || words.length === 0) return;

    const width = 600;
    const height = 380;

    // Remove previous content
    d3.select("#wordcloud-svg").selectAll("*").remove();

    // Set up the cloud layout
    const layout = cloud()
      .size([width, height])
      .words(words.map((d) => ({
        text: d.text,
        size: d.value * 3 + 12 // size scaling; adjust as needed
      })))
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .font("Poppins")
      .fontWeight(tab === "challenges" ? "normal" : "bold")
      .fontStyle(tab === "challenges" ? "italic" : "normal")
      .spiral("archimedean")
      .on("end", draw);

    layout.start();

    function draw(wordsArr) {
      const svg = d3
        .select("#wordcloud-svg")
        .attr("viewBox", [0, 0, width, height])
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      svg
        .selectAll("text")
        .data(wordsArr)
        .enter()
        .append("text")
        .style("font-family", "Poppins, sans-serif")
        .style("fill", (d, i) => tealPalette[i % tealPalette.length])
        .style("font-style", tab === "challenges" ? "italic" : "normal")
        .style("font-weight", tab === "challenges" ? "normal" : "bold")
        .style("font-size", (d) => `${d.size}px`)
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text((d) => d.text);
    }
    // eslint-disable-next-line
  }, [tab, JSON.stringify(words)]);

  // Compute only if tab or appJson changes
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
        return appJson.visualizations.challenges.map((sent, i) => ({
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

  const options = getWordCloudOptions(tab);
  if (tab === "challenges") options.fontSizes = [18, 38];

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
        <svg id="wordcloud-svg" width="100%" height="380"></svg>
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
