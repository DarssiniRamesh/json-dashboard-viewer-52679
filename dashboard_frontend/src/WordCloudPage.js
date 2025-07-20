import React from "react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import "./WordCloudPage.css";
import appData from "./app.json";
import WordCloud from "react-wordcloud";

/**
 * Extracts unique, non-empty keywords from a given field across a list of app objects.
 * Handles both array and comma-separated string fields, cleans and deduplicates.
 */
function extractKeywords(apps, field) {
  const seen = new Set();
  const keywords = [];
  apps.forEach(app => {
    let fieldWords = [];
    if (Array.isArray(app[field])) {
      fieldWords = app[field];
    } else if (typeof app[field] === "string") {
      // Split by comma/semicolon
      fieldWords = app[field].split(/[,;]/).map(word => word.trim());
    }
    fieldWords.forEach(word => {
      const clean = word.trim().replace(/[^a-zA-Z0-9 _-]/g, "");
      if (clean.length > 0 && !seen.has(clean)) {
        seen.add(clean);
        keywords.push(clean);
      }
    });
  });
  return keywords;
}

/**
 * Extracts all candidate keywords from all apps, prioritizing by frequency.
 */
function extractAllKeywords(apps, field) {
  const wordCounts = {};
  apps.forEach(app => {
    let fieldWords = [];
    if (Array.isArray(app[field])) {
      fieldWords = app[field];
    } else if (typeof app[field] === "string") {
      fieldWords = app[field].split(/[,;]/).map(word => word.trim());
    }
    fieldWords.forEach(word => {
      const clean = word.trim().replace(/[^a-zA-Z0-9 _-]/g, "");
      if (clean.length > 0) {
        wordCounts[clean] = (wordCounts[clean] || 0) + 1;
      }
    });
  });
  return wordCounts;
}

/**
 * Creates a react-wordcloud dataset, picking most relevant/most frequent words, with a `value` for weight.
 */
function makeWordCloudWords(wordCounts, minKeywords = 12, maxKeywords = 25) {
  const sorted = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, maxKeywords);
  // Limit at least minKeywords if available, up to maxKeywords
  const words = [];
  sorted.forEach(([text, count], ix) => {
    if (words.length < maxKeywords && text && count)
      words.push({ text, value: count });
  });
  return words.slice(0, Math.max(minKeywords, Math.min(words.length, maxKeywords)));
}

// Prepare data
const topApps = [...appData]
  .sort((a, b) => (b.score || 0) - (a.score || 0))
  .slice(0, 10);

// Integrations
const integrationCounts = extractAllKeywords(appData, "third_party_integrations");
const integrationsWords = makeWordCloudWords(integrationCounts, 10, 22);

// Features
const featureCounts = extractAllKeywords(appData, "unique_features");
const featuresWords = makeWordCloudWords(featureCounts, 10, 22);

// Cloud config
const wordCloudOptions = {
  rotations: 2,
  rotationAngles: [-40, 35],
  scale: "sqrt",
  spiral: "archimedean",
  fontSizes: [16, 55],
  enableTooltip: true,
  fontFamily: "Poppins, Arial, Helvetica, sans-serif",
  deterministic: false,
  transitionDuration: 800,
  colors: ["#1976D2", "#00ACC1", "#43A047", "#FFC107", "#E53935", "#8E24AA"],
};

/**
 * PUBLIC_INTERFACE
 *
 * Renders the WordCloud page with react-wordcloud for both
 * Third-party Integrations and Unique Features. Accepts no props.
 * Data extracted from app.json.
 */
function WordCloudPage() {
  return (
    <div className="wordcloud-page">
      <h2>Word Clouds</h2>

      <div className="wordcloud-section">
        <h3>Third-party Integrations</h3>
        <div className="cloud-container">
          <WordCloud
            words={integrationsWords}
            options={wordCloudOptions}
          />
        </div>
      </div>

      <div className="wordcloud-section">
        <h3>Unique Features</h3>
        <div className="cloud-container">
          <WordCloud
            words={featuresWords}
            options={wordCloudOptions}
          />
        </div>
      </div>
    </div>
  );
}

export default WordCloudPage;
