import React, { useState, useEffect } from "react";
import "./App.css";
import appData from "./app.json";

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

// Utility for grouping entries by week
function groupByWeek(arr, dateKey) {
  const weeks = {};
  arr.forEach((el) => {
    const date = new Date(el[dateKey]);
    // Assume week starts Monday
    const weekId = `${date.getFullYear()}-W${getWeekNumber(date)}`;
    if (!weeks[weekId]) weeks[weekId] = [];
    weeks[weekId].push(el);
  });
  return weeks;
}

// Return number of week in year for JS Date
function getWeekNumber(date) {
  // Copy date so don't modify original
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  return weekNo;
}

function getWeekLabel(weekId) {
  // E.g. '2024-W13' → 'Week 13 (2024)'
  const [year, wk] = weekId.split("-W");
  return `Week ${wk} (${year})`;
}

// ----- Widgets -----

// PUBLIC_INTERFACE
function TotalAppsWidget({ total }) {
  /** Widget for showing total apps */
  return (
    <div className="dashboard-card highlight">
      <h3>Total Apps</h3>
      <span className="dashboard-stat">{total}</span>
    </div>
  );
}

// PUBLIC_INTERFACE
function SubmissionsByWeekWidget({ submissionsByWeek }) {
  /** Bar chart widget for number of submissions per week */
  const weekIds = Object.keys(submissionsByWeek).sort();
  const max = Math.max(...weekIds.map((w) => submissionsByWeek[w].length));

  return (
    <div className="dashboard-card">
      <h3>Submissions by Week</h3>
      <div style={{ display: "flex", gap: 8, alignItems:"end", minHeight: 120 }}>
        {weekIds.map((w) => (
          <div key={w} style={{ flex:1, display: "flex", flexDirection: "column", alignItems:"center"}}>
            <div style={{
              background: COLORS.primary,
              width: 24,
              height: 80 * (submissionsByWeek[w].length/max || 0.1),
              borderRadius: 6,
            }} />
            <div className="stat-label">{w.split("-W")[1]}</div>
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
function VotesByWeekWidget({ votesByWeek }) {
  /** Bar chart widget for votes per week */
  const weekIds = Object.keys(votesByWeek).sort();
  const max = Math.max(...weekIds.map((w) => votesByWeek[w]));
  return (
    <div className="dashboard-card">
      <h3>Votes by Week</h3>
      <div style={{ display: "flex", gap: 8, alignItems:"end", minHeight: 120 }}>
        {weekIds.map((w) => (
          <div key={w} style={{ flex:1, display: "flex", flexDirection: "column", alignItems:"center"}}>
            <div style={{
              background: COLORS.primary,
              width: 24,
              height: 80 * (votesByWeek[w]/max || 0.1),
              borderRadius: 6,
            }} />
            <div className="stat-label">{w.split("-W")[1]}</div>
            <div className="stat-caption">{votesByWeek[w]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function TopAppsWidget({ weekId, apps }) {
  /** Widget showing top 10 apps for a given week */
  return (
    <div className="dashboard-card">
      <h4>{getWeekLabel(weekId)}</h4>
      <table className="top-apps-table">
        <thead>
          <tr>
            <th>App Name</th><th>Previews</th><th>Visits</th><th>Votes</th>
          </tr>
        </thead>
        <tbody>
          {apps.slice(0,10).map((app,i) =>
            <tr key={app.id || app.name || i}>
              <td>{app.name}</td>
              <td>{app.preview_count ?? "-"}</td>
              <td>{app.visit_count ?? "-"}</td>
              <td>{app.votes ?? 0}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// PUBLIC_INTERFACE
function WordCloud({ words }) {
  /** Simple word-frequency cloud as responsive spans */
  // Normalize counts for font size [0.9em-2em]
  const min = Math.min(...Object.values(words)), max = Math.max(...Object.values(words));
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

function App() {
  // --------- Navigation ----------
  const NAV = [
    ["/", "Dashboard"],
    ["/clouds", "Word/Sentence Cloud"]
  ];
  const [route, setRoute] = useState(window.location.hash.replace("#","") || "/");
  useEffect(() => {
    window.onhashchange = () =>
      setRoute(window.location.hash.replace("#","") || "/");
  }, []);

  // --------- Data Extraction from app.json ----------
  // app.json expected to be an array of app entries with submission/vote info
  // Make robust: force into array if not already one
  let entriesRaw = appData.entries || appData || [];
  let entries = Array.isArray(entriesRaw)
    ? entriesRaw
    : (typeof entriesRaw === "object" && entriesRaw !== null)
      ? Object.values(entriesRaw)
      : [];
  // handle both "appData.entries" (if array is under this field) or just array

  // Get week grouping for submissions and votes
  const submissionsByWeek = groupByWeek(entries, "submission_date"); // {weekId: [apps...]}
  const weekIds = Object.keys(submissionsByWeek).sort();
  // Map: {weekId: total vote count
  const votesByWeek = {};
  let voteTotal = 0;
  entries.forEach((app) => {
    const date = new Date(app.submission_date);
    const weekId = `${date.getFullYear()}-W${getWeekNumber(date)}`;
    votesByWeek[weekId] = (votesByWeek[weekId] || 0) + (app.votes ?? 0);
    voteTotal += (app.votes ?? 0);
  });

  // Four widgets for top 10 apps per week
  const weekTopApps = {};
  weekIds.forEach((weekId) => {
    // Sort by votes, then visits, then preview_count for each week
    weekTopApps[weekId] = submissionsByWeek[weekId]
      .slice()
      .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)
                      || (b.visit_count ?? 0) - (a.visit_count ?? 0)
                      || (b.preview_count ?? 0) - (a.preview_count ?? 0));
  });

  // Word clouds and sentence cloud source extraction
  // Suppose every entry has "third_party_integrations", "unique_features", "challenges" fields (comma/semicolon or string array)
  function wordFreq(arrOfStr) {
    // Flatten and count words
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
  // Unique Feature Cloud
  const featureWords = wordFreq(entries.map(x=>x.unique_features));
  // Third Party Cloud
  const integrationWords = wordFreq(entries.map(x=>x.third_party_integrations));
  // Challenges (sentence chips)
  const challengeSentences = [];
  entries.forEach(x => {
    if (!x.challenges) return;
    if (Array.isArray(x.challenges))
      x.challenges.forEach(s=>challengeSentences.push(s.trim()));
    else
      x.challenges.toString().split(/[;•\n]/).forEach(s=>{
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
            <div className="dashboard-row">
              <TotalAppsWidget total={entries.length} />
              <SubmissionsByWeekWidget submissionsByWeek={submissionsByWeek}/>
              <TotalVotesWidget totalVotes={voteTotal}/>
              <VotesByWeekWidget votesByWeek={votesByWeek}/>
            </div>
            <div className="dashboard-row top-apps-row">
              {weekIds.slice(0,4).map((weekId) =>
                <TopAppsWidget
                  key={weekId}
                  weekId={weekId}
                  apps={weekTopApps[weekId]}
                />
              )}
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
        ) : null}
      </main>
    </div>
  );
}

export default App;
