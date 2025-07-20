import React, { useState, useEffect } from "react";
import "./App.css";
import appData from "./app.json";
import TopAppsPage from "./TopAppsPage";

// Simple teal minimalist theme colors
const COLORS = {
  primary: "#008080",
  secondary: "#E0F2F1",
  accent: "#A7FFEB",
  text: "#1a2b29",
  white: "#fff",
  grey: "#adb5bd",
  card: "#f8fafc",
};

/**
 * Utility for grouping contest entries by contest_week_id,
 * using contest_week_name or fallback to "Week {id}"
 * Returns { [contest_week_id]: { label, entries } }
 */
function groupByContestWeek(arr) {
  const weeks = {};
  arr.forEach((el) => {
    const weekId = el.contest_week_id || "0";
    if (!weeks[weekId]) {
      // Use label from contest_week_name or fallback
      const label =
        el.contest_week_name || (weekId ? `Week ${weekId}` : "Week Unknown");
      weeks[weekId] = { label, entries: [] };
    }
    weeks[weekId].entries.push(el);
  });
  return weeks;
}


// ----- Widgets -----
/** Widget for showing total apps */
// PUBLIC_INTERFACE
function TotalAppsWidget({ total }) {
  return (
    <div className="dashboard-card highlight">
      <h3>Total Apps</h3>
      <span className="dashboard-stat">{total}</span>
    </div>
  );
}
// PUBLIC_INTERFACE
function SubmissionsByWeekWidget({ submissionsByWeek, weekLabels }) {
  /** Bar chart widget for number of submissions per contest week */
  const weekIds = Object.keys(submissionsByWeek);
  const max = Math.max(...weekIds.map((w) => submissionsByWeek[w].length));
  return (
    <div className="dashboard-card">
      <h3>Submissions by Week</h3>
      <div style={{ display: "flex", gap: 8, alignItems: "end", minHeight: 120 }}>
        {weekIds.map((w) => (
          <div
            key={w}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: COLORS.primary,
                width: 24,
                height: 80 * (submissionsByWeek[w].length / max || 0.1),
                borderRadius: 6,
              }}
            />
            <div className="stat-label">
              {weekLabels && weekLabels[w] ? weekLabels[w] : `Week ${w}`}
            </div>
            <div className="stat-caption">{submissionsByWeek[w].length}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
// PUBLIC_INTERFACE
function TotalVotesWidget({ totalVotes }) {
  /** Widget for showing total votes */
  return (
    <div className="dashboard-card highlight">
      <h3>Total Votes</h3>
      <span className="dashboard-stat">{totalVotes}</span>
    </div>
  );
}
// PUBLIC_INTERFACE
function VotesByWeekWidget({ votesByWeek, weekLabels }) {
  /** Bar chart widget for votes per contest week */
  const weekIds = Object.keys(votesByWeek);
  const max = Math.max(...weekIds.map((w) => votesByWeek[w]));
  return (
    <div className="dashboard-card">
      <h3>Votes by Week</h3>
      <div style={{ display: "flex", gap: 8, alignItems: "end", minHeight: 120 }}>
        {weekIds.map((w) => (
          <div
            key={w}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: COLORS.primary,
                width: 24,
                height: 80 * (votesByWeek[w] / max || 0.1),
                borderRadius: 6,
              }}
            />
            <div className="stat-label">
              {weekLabels && weekLabels[w] ? weekLabels[w] : `Week ${w}`}
            </div>
            <div className="stat-caption">{votesByWeek[w]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
// PUBLIC_INTERFACE
function TopAppsWidget({ weekLabel, apps }) {
  /** Widget showing top 10 apps for a given contest week */
  return (
    <div className="dashboard-card">
      <h4>{weekLabel}</h4>
      <table className="top-apps-table">
        <thead>
          <tr>
            <th>App Name</th>
            <th>Previews</th>
            <th>Visits</th>
            <th>Votes</th>
          </tr>
        </thead>
        <tbody>
          {(apps || []).slice(0, 10).map((app, i) => (
            <tr key={app.app_id || app.app_name || i}>
              <td>{app.app_name ?? app.name}</td>
              <td>{app.preview_count ?? "-"}</td>
              <td>{app.visit_count ?? "-"}</td>
              <td>{app.vote_count ?? app.votes ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
// PUBLIC_INTERFACE
function WordCloud({ words }) {
  /** Simple word-frequency cloud as responsive spans */
  // Normalize counts for font size [0.9em-2em]
  const min = Math.min(...Object.values(words) || [1]), max = Math.max(...Object.values(words) || [2]);
  return (
    <div className="word-cloud">
      {Object.entries(words).map(([w,c])=>
        <span
          key={w}
          style={{
            fontSize: `${0.9 + 1.1*((c-min)/(max-min || 1))}em`,
            margin: "0.17em",
            color: COLORS.primary,
            fontWeight: 500,
            wordBreak:"break-word"
          }}
        >{w}</span>
      )}
    </div>
  );
}
// PUBLIC_INTERFACE
function SentenceCloud({ sentences }) {
  /** Sentences in light capsule "chips", cloud layout */
  return (
    <div className="sentence-cloud">
      {sentences.map(s =>
        <span className="sentence-chip" key={s}>{s}</span>
      )}
    </div>
  );
}
// PUBLIC_INTERFACE
function Sidebar({ nav, active, onNav }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Dashboard</div>
      <nav>
        {[...nav].map(([route,label]) =>
          <div key={route}
                onClick={()=>onNav(route)}
                className={`sidebar-link${active===route ? " active" : ""}`}>
            {label}
          </div>
        )}
      </nav>
    </aside>
  );
}
// PUBLIC_INTERFACE
function Header() {
  return (
    <header className="app-header">
      <h2>App Analytics Dashboard</h2>
    </header>
  );
}

/**
 * PUBLIC_INTERFACE
 * Dashboard application rendering data directly from app.json.
 * All widget/analytic/page logic consumes the real array from appData.
 */
function App() {
  // --------- Navigation ----------
  const NAV = [
    ["/", "Dashboard"],
    ["/clouds", "Word/Sentence Cloud"],
    ["/top-apps", "Top 10 Apps per Week"]
  ];
  const [route, setRoute] = useState(window.location.hash.replace("#","") || "/");
  useEffect(() => {
    window.onhashchange = () =>
      setRoute(window.location.hash.replace("#","") || "/");
  }, []);

  // --------- Data Extraction: use appData as array directly ----------
  const entries = Array.isArray(appData) ? appData : [];

  // If data is NOT available, create fallback sample data for troubleshooting UI
  const fallbackEntries = [
    {
      app_id: "sample-1",
      app_name: "Sample App",
      app_created_at: "2025-06-22T00:00:00Z",
      vote_count: 99,
      unique_features: "AI, Cloud, Fun",
      third_party_integrations: "API,DB",
      challenges_faced: "Getting data to display",
      visit_count: 1000,
      preview_count: 100,
    },
  ];
  const validEntries = entries && entries.length > 0 ? entries : fallbackEntries;

  // ---------- Group data by contest week ----------
  const weeks = groupByContestWeek(validEntries);
  // Sorted by week id (as integer) for presentational order
  const weekIds = Object.keys(weeks)
    .filter(k => k && !isNaN(Number(k)))
    .sort((a, b) => Number(a) - Number(b));
  // Fallback for data without contest_week_id
  if (weekIds.length === 0 && Object.keys(weeks).length > 0) {
    weekIds.push(...Object.keys(weeks));
  }

  // Submissions by week (count)
  const submissionsByWeek = {};
  weekIds.forEach((weekId) => {
    submissionsByWeek[weekId] = weeks[weekId]?.entries ?? [];
  });

  // Votes by week
  const votesByWeek = {};
  let voteTotal = 0;
  weekIds.forEach((weekId) => {
    const apps = weeks[weekId]?.entries || [];
    votesByWeek[weekId] = apps.reduce(
      (acc, app) => acc + (app.vote_count ?? app.votes ?? 0),
      0
    );
    voteTotal += votesByWeek[weekId] || 0;
  });

  // Top apps per week
  const weekTopApps = {};
  weekIds.forEach((weekId) => {
    weekTopApps[weekId] = (weeks[weekId]?.entries ?? [])
      .slice()
      .sort(
        (a, b) =>
          (b.vote_count ?? b.votes ?? 0) - (a.vote_count ?? a.votes ?? 0) ||
          (b.visit_count ?? 0) - (a.visit_count ?? 0) ||
          (b.preview_count ?? 0) - (a.preview_count ?? 0)
      );
  });

  // Word and sentence clouds
  function wordFreq(arrOfStr) {
    const freq = {};
    arrOfStr.forEach(phrase => {
      if (!phrase) return;
      if (Array.isArray(phrase)) phrase = phrase.join(", ");
      phrase.toString().split(/[;,]/).forEach(word => {
        const w = word.trim();
        if (w) freq[w] = (freq[w] || 0) + 1;
      });
    });
    return freq;
  }
  const featureWords = wordFreq(validEntries.map(x=>x.unique_features));
  const integrationWords = wordFreq(validEntries.map(x=>x.third_party_integrations));
  const challengeSentences = [];
  validEntries.forEach(x => {
    const challengesValue = x.challenges_faced ?? x.challenges;
    if (!challengesValue) return;
    if (Array.isArray(challengesValue))
      challengesValue.forEach(s=>challengeSentences.push(s.trim()));
    else
      challengesValue.toString().split(/[;\u2022\\n]/).forEach(s=>{
        const s2 = s.trim();
        if (s2.length > 2) challengeSentences.push(s2);
      });
  });

  // --------- Main Rendering ---------
  return (
    <div className="app-root" style={{ background: COLORS.secondary }}>
      <Sidebar nav={NAV} active={route} onNav={(r) => {setRoute(r); window.location.hash=r;}}/>
      <main>
        <Header/>
        {route === "/" ? (
          <div className="dashboard-container">
            {/* Display a warning if fallback data is in use */}
            {validEntries === fallbackEntries && (
              <div style={{
                color: "#B71C1C",
                background: "#FFEBEE",
                border: "1px solid #E57373",
                padding: "10px",
                marginBottom: "16px",
                borderRadius: "6px",
                textAlign: "center"
              }}>
                <b>Warning:</b> No data loaded from app.json! Showing test diagnostics. <br/>
                (Check console logs for more details.)
              </div>
            )}
            <div className="dashboard-row">
              <TotalAppsWidget total={validEntries.length} />
              <SubmissionsByWeekWidget
                submissionsByWeek={submissionsByWeek}
                weekLabels={weekIds.reduce((acc, id) => {
                  acc[id] = weeks[id]?.label ?? `Week ${id}`;
                  return acc;
                }, {})}
              />
              <TotalVotesWidget totalVotes={voteTotal} />
              <VotesByWeekWidget
                votesByWeek={votesByWeek}
                weekLabels={weekIds.reduce((acc, id) => {
                  acc[id] = weeks[id]?.label ?? `Week ${id}`;
                  return acc;
                }, {})}
              />
            </div>
            <div className="dashboard-row top-apps-row">
              {weekIds.slice(0, 4).map((weekId) => (
                <TopAppsWidget
                  key={weekId}
                  weekLabel={weeks[weekId]?.label ?? `Week ${weekId}`}
                  apps={weekTopApps[weekId]}
                />
              ))}
            </div>
          </div>
        ) : route === "/clouds" ? (
          <div className="cloudpage">
            <h3>Word/Sentence Clouds</h3>
            <div className="cloud-widgets">
              <section>
                <h5>Third-party Integrations</h5>
                <WordCloud words={integrationWords}/>
              </section>
              <section>
                <h5>Unique Features</h5>
                <WordCloud words={featureWords}/>
              </section>
              <section>
                <h5>Challenges Faced</h5>
                <SentenceCloud sentences={challengeSentences}/>
              </section>
            </div>
          </div>
        ) : route === "/top-apps" ? (
          <TopAppsPage />
        ) : null}
      </main>
    </div>
  );
}

export default App;
