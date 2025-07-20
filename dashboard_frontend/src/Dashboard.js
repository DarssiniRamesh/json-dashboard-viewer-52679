import React, { useMemo } from "react";
import {
  Bar,
  Line,
  Pie,
  defaults as chartDefaults,
} from "react-chartjs-2";
import "chart.js/auto";
import WordCloud from "react-wordcloud";
import "./App.css";

function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

function weekOf(dateString) {
  const d = new Date(dateString);
  const onejan = new Date(d.getFullYear(), 0, 1);
  return (
    "W" +
    Math.ceil(
      ((d - onejan) / 86400000 + onejan.getDay() + 1) / 7
    ) +
    ", " +
    d.getFullYear()
  );
}

function groupByWeek(apps) {
  // { "W12, 2024": [app, ...], ... }
  return apps.reduce((acc, app) => {
    const week = weekOf(app.submitted_at);
    if (!acc[week]) acc[week] = [];
    acc[week].push(app);
    return acc;
  }, {});
}

function getTopN(arr, n, field = "votes") {
  // Sort desc by votes (or specified field)
  return [...arr]
    .sort((a, b) => (b[field] || 0) - (a[field] || 0))
    .slice(0, n);
}

function uniqueFeatures(apps) {
  // Count all features (strings in each app.features)
  const counter = {};
  apps.forEach((a) =>
    (a.features || []).forEach((f) => {
      counter[f] = (counter[f] || 0) + 1;
    })
  );
  return Object.entries(counter)
    .map(([feature, count]) => ({ text: feature, value: count }))
    .sort((a, b) => b.value - a.value);
}

function thirdPartyTechWordCloud(apps) {
  // Flatten all integrations/third_party fields across all apps
  const counts = {};
  apps.forEach((a) =>
    (a.integrations || []).forEach((i) => {
      counts[i] = (counts[i] || 0) + 1;
    })
  );
  return Object.entries(counts).map(([text, value]) => ({ text, value }));
}

function challengePhraseCloud(apps) {
  // Aggregate all challenge/problem_sentences or similar field
  const counts = {};
  apps.forEach((a) =>
    (a.challenges || []).forEach((sentence) => {
      // Could n-gram or just by sentence for demo
      let s = sentence.trim();
      counts[s] = (counts[s] || 0) + 1;
    })
  );
  return Object.entries(counts).map(([text, value]) => ({ text, value }));
}

// PUBLIC_INTERFACE
export default function Dashboard({ data }) {
  /**
   * The top-level dashboard UI displaying all sections, stats, analytics blocks, charts, and clouds.
   * @param {object} data - analytics data loaded from appvote.json
   */
  // Move all React hooks (useMemo) to the top-level and guard with fallback data
  const apps = data && Array.isArray(data.apps) ? data.apps : [];
  const appCount = apps.length;
  const totalVotes = apps.reduce((acc, app) => acc + (app.votes || 0), 0);

  // Week grouping
  const appsByWeek = useMemo(() => groupByWeek(apps), [apps]);
  const weeks = Object.keys(appsByWeek).sort(
    (a, b) => (a > b ? -1 : 1)
  );

  if (!data || !Array.isArray(data.apps)) {
    return (
      <div className="dashboard-error">
        Could not display dashboard: No apps data found.
      </div>
    );
  }

  // Top voted apps (overall and weekwise)
  const top10Apps = getTopN(apps, 10, "votes");
  const topAppsByWeek = {};
  weeks.forEach((wk) => {
    topAppsByWeek[wk] = getTopN(appsByWeek[wk], 10, "votes");
  });

  // Unique features (top 20 by votes) weekwise
  const featuresByWeek = {};
  weeks.forEach((wk) => {
    featuresByWeek[wk] = uniqueFeatures(appsByWeek[wk]).slice(0, 20);
  });

  // Word clouds
  const thirdPartyCloudData = thirdPartyTechWordCloud(apps);
  const challengeCloudData = challengePhraseCloud(apps);

  // Chart datasets for weekly votes/submission trends
  const weekVoteStats = weeks
    .map((w) => ({
      week: w,
      votes: appsByWeek[w].reduce((a, ap) => a + (ap.votes || 0), 0),
      submissions: appsByWeek[w].length,
    }))
    .reverse(); // oldest first

  const votesData = {
    labels: weekVoteStats.map((s) => s.week),
    datasets: [
      {
        label: "Total Votes",
        data: weekVoteStats.map((s) => s.votes),
        backgroundColor: "rgba(25, 118, 210, 0.8)", // oceanic blue
        borderColor: "#1976D2",
        borderWidth: 2,
      },
    ],
  };

  const submissionsData = {
    labels: weekVoteStats.map((s) => s.week),
    datasets: [
      {
        label: "App Submissions",
        data: weekVoteStats.map((s) => s.submissions),
        backgroundColor: "rgba(0, 191, 255, 0.5)",
        borderColor: "#00BFFF",
        borderWidth: 2,
      },
    ],
  };

  // For responsive layout
  return (
    <main className="dashboard-main">
      {/* Summary/Key Outcomes */}
      <section className="analytics-summary">
        <div className="summary-block">
          <div className="summary-headline">Total Apps</div>
          <div className="summary-number">{appCount}</div>
        </div>
        <div className="summary-block">
          <div className="summary-headline">Total Votes</div>
          <div className="summary-number">{totalVotes}</div>
        </div>
        <div className="summary-block">
          <div className="summary-headline">Weeks Participated</div>
          <div className="summary-number">{weeks.length}</div>
        </div>
      </section>

      {/* Trends and Analytics */}
      <div className="dashboard-grid">
        <section className="dashboard-block">
          <h2>Weekly App Submissions</h2>
          <Bar data={submissionsData} height={180} options={{plugins:{legend:{display:false}}, responsive:true, maintainAspectRatio:false}} />
        </section>
        <section className="dashboard-block">
          <h2>Weekly Votes Received</h2>
          <Line data={votesData} height={180} options={{plugins:{legend:{display:false}}, responsive:true, maintainAspectRatio:false}} />
        </section>
        <section className="dashboard-block">
          <h2>Word Cloud: Third-Party Integrations</h2>
          <WordCloud
            words={thirdPartyCloudData}
            options={{
              rotations: 2,
              rotationAngles: [-30, 30],
              fontSizes: [18, 38],
              fontFamily: "Montserrat, Arial",
              colors: ["#00BFFF", "#1976D2", "#40CFFF", "#A7D7FF"],
              enableTooltip: true,
              deterministic: false,
            }}
            style={{ width: "100%", height: "200px" }}
          />
        </section>
        <section className="dashboard-block">
          <h2>Sentence Cloud: Challenges Identified</h2>
          <WordCloud
            words={challengeCloudData}
            options={{
              rotations: 2,
              rotationAngles: [-15, 15],
              fontSizes: [14, 32],
              fontFamily: "Montserrat, Arial",
              colors: ["#60ECFF", "#0567BB", "#79B6FA", "#0A192F"],
              enableTooltip: true,
              deterministic: false,
            }}
            style={{ width: "100%", height: "200px" }}
          />
        </section>
      </div>

      {/* Top Voted Apps */}
      <section className="top-apps-section">
        <h2>Top 10 Voted Apps (Overall)</h2>
        <div className="top-apps-row">
          {top10Apps.map((app, idx) => (
            <div key={app.id || idx} className="top-app-card">
              <div className="top-app-rank">#{idx + 1}</div>
              {app.image ? (
                <img
                  className="top-app-image"
                  src={app.image}
                  alt={app.name}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="top-app-placeholder-img">📦</div>
              )}
              <a
                href={app.link || "#"}
                className="top-app-name"
                target="_blank"
                rel="noopener noreferrer"
              >
                {app.name}
              </a>
              <div className="top-app-votes">{app.votes} votes</div>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Unique Features */}
      <section className="weekly-unique-features">
        <h2>Unique Features: Top 20 Voted (By Week)</h2>
        <div className="features-weeks-tabs">
          {weeks.map((wk, i) => (
            <details key={wk} open={i === 0}>
              <summary>{wk}</summary>
              <div className="feature-cloud-row">
                {featuresByWeek[wk].length ? (
                  <WordCloud
                    words={featuresByWeek[wk]}
                    options={{
                      fontFamily: "Montserrat, Arial",
                      colors: ["#00BFFF", "#1976D2"],
                      enableTooltip: true,
                      fontSizes: [14, 28],
                      deterministic: false,
                    }}
                    style={{ width: "360px", height: "150px" }}
                  />
                ) : (
                  <em className="no-features-msg">
                    No unique features described this week.
                  </em>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Weekly Top App Lists */}
      <section className="weekly-topapps">
        <h2>Top 10 Voted Apps Each Week</h2>
        <div className="weeks-topapps-list">
          {weeks.map((wk, i) => (
            <div className="week-topapps-block" key={wk}>
              <h3>{wk}</h3>
              <ul className="week-apps-ul">
                {topAppsByWeek[wk].map((app, j) => (
                  <li key={app.id || j}>
                    <span className="week-app-rank">#{j + 1}</span>{" "}
                    <a
                      href={app.link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="week-app-link"
                    >
                      {app.name}
                    </a>
                    <span className="week-app-votes">({app.votes} votes)</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
