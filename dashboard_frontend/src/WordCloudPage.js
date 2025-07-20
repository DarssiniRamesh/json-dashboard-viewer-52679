import React from 'react';
import './WordCloudPage.css';
import appData from './app.json';

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
    } else if (typeof app[field] === 'string') {
      // Split by comma/semicolon
      fieldWords = app[field].split(/[,;]/).map(word => word.trim());
    }
    fieldWords.forEach(word => {
      const clean = word.trim().replace(/[^a-zA-Z0-9 _-]/g, '');
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
 * Returns unique, non-empty keywords.
 */
function extractAllKeywords(apps, field) {
  const wordCounts = {};
  apps.forEach(app => {
    let fieldWords = [];
    if (Array.isArray(app[field])) {
      fieldWords = app[field];
    } else if (typeof app[field] === 'string') {
      fieldWords = app[field].split(/[,;]/).map(word => word.trim());
    }
    fieldWords.forEach(word => {
      const clean = word.trim().replace(/[^a-zA-Z0-9 _-]/g, '');
      if (clean.length > 0) {
        wordCounts[clean] = (wordCounts[clean] || 0) + 1;
      }
    });
  });
  // Sort by descending freq, then alphabetically
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([word]) => word);
}

/**
 * Aggregates keywords to ensure at least minKeywords unique entries, 
 * pulling extras from all apps' data in order of relevance/frequency.
 * Removes empties and duplicates.
 */
function aggregateKeywords(primarySets, allSet, minKeywords = 12) {
  const seen = new Set();
  let results = [];

  // 1. Add top relevant (usually from top apps)
  primarySets.forEach(word => {
    const clean = word.trim();
    if (clean.length > 0 && !seen.has(clean)) {
      seen.add(clean);
      results.push(clean);
    }
  });

  // 2. Fill from global set if not enough
  for (let word of allSet) {
    const clean = word.trim();
    if (clean.length > 0 && !seen.has(clean)) {
      seen.add(clean);
      results.push(clean);
    }
    if (results.length >= minKeywords)
      break;
  }

  // 3. Ensure exactly minKeywords, no more
  return results.slice(0, minKeywords);
}

const topApps = [...appData]
  .sort((a, b) => (b.score || 0) - (a.score || 0))
  .slice(0, 10);

const integrationKeywordsTop = extractKeywords(topApps, 'third_party_integrations');
const integrationKeywordsAll = extractAllKeywords(appData, 'third_party_integrations');
const integrationKeywords = aggregateKeywords(integrationKeywordsTop, integrationKeywordsAll, 12);

const featureKeywordsTop = extractKeywords(topApps, 'unique_features');
const featureKeywordsAll = extractAllKeywords(appData, 'unique_features');
const featureKeywords = aggregateKeywords(featureKeywordsTop, featureKeywordsAll, 12);

export default function WordCloudPage() {
  return (
    <div className="wordcloud-page">
      <h2>Word Clouds</h2>
      <div className="wordcloud-section">
        <h3>Third-party Integrations</h3>
        <div className="wordcloud">
          {integrationKeywords.map((keyword, i) => (
            <span key={keyword} className={`word size${(i % 5) + 1}`}>{keyword}</span>
          ))}
        </div>
      </div>
      <div className="wordcloud-section">
        <h3>Unique Features</h3>
        <div className="wordcloud">
          {featureKeywords.map((keyword, i) => (
            <span key={keyword} className={`word size${(i % 5) + 1}`}>{keyword}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
