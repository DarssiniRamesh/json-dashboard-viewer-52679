import React, { useState } from "react";
import ReactWordcloud from "react-wordcloud";
import "./WordCloudPage.css";
import appJson from "./app.json";

/**
 * Extract and prepare word cloud data from appJson.
 * Update this function as your schema changes.
 */
function getCloudDataFromAppJson(tab) {
  // You might want to adapt this if your structure changes.
  // For demo, fallback to the previous hardcoded data if appJson structure doesn't include expected fields.

  if (
    appJson &&
    appJson.visualizations &&
    typeof appJson.visualizations === "object"
  ) {
    if (tab === "integrations" && appJson.visualizations.integrations) {
      // Example schema: [{ word: "Supabase", freq: 18 }, ...]
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
      // For "challenges", treat sentences as "words" (sentence cloud)
      return appJson.visualizations.challenges.map((sent, i) => ({
        text: sent,
        value: 10 + (sent.length % 10), // subtle size variation by length
      }));
    }
  }

  // Fallback static if appJson is missing/invalid
  if (tab === "integrations") {
    return [
      { text: "Supabase", value: 18 },
      { text: "AWS", value: 13 },
      { text: "Stripe", value: 11 },
      { text: "Twilio", value: 7 },
      { text: "OAuth", value: 10 },
      { text: "OpenAI", value: 9 },
      { text: "Google", value: 6 },
    ];
  } else if (tab === "features") {
    return [
      { text: "AI-powered", value: 17 },
      { text: "Real-time Sync", value: 11 },
      { text: "API-first", value: 9 },
      { text: "Custom Widgets", value: 12 },
      { text: "Mobile Responsive", value: 10 },
      { text: "Dark Mode", value: 7 },
      { text: "Internationalization", value: 6 },
    ];
  } else if (tab === "challenges") {
    return [
      {
        text: "Rate limits and quotas",
        value: 20,
      },
      {
        text: "Vendor lock-in risk",
        value: 14,
      },
      {
        text: "Async data race conditions",
        value: 16,
      },
      {
        text: "Third-party API instability",
        value: 13,
      },
      {
        text: "UI performance tuning",
        value: 15,
      },
      {
        text: "Security compliance overhead",
        value: 16,
      },
      {
        text: "Integration test complexity",
        value: 11,
      },
    ];
  }
  return [];
}

/**
 * Teal-friendly word cloud palette for prominent/less prominent words.
 */
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

/**
 * Custom word cloud options for visual richness
 */
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

/**
 * Responsive container for word clouds
 */
function WordCloudPage() {
  const [tab, setTab] = useState("integrations");
  const words = getCloudDataFromAppJson(tab);
  const options = getWordCloudOptions(tab);

  // For sentence cloud, tweak min/max size
  if (tab === "challenges") {
    options.fontSizes = [18, 38];
  }

  return (
    <div className="wordcloud-page">
      <h2>Project Word & Sentence Clouds</h2>
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
        <ReactWordcloud
          words={words}
          options={options}
          style={{ height: 380, width: "100%" }}
        />
      </div>
      <div className="cloud-legend">
        <span>
          <b>Tip:</b> Larger and bolder words/phrases are more prominent.
        </span>
      </div>
    </div>
  );
}

export default WordCloudPage;
