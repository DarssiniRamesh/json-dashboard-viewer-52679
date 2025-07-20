import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import "./AnalyticsPage.css";

/**
 * PUBLIC_INTERFACE
 * Try to extract an array of apps from loaded JSON data, robustly handling:
 * - Root-level array (return as is if array of objects)
 * - Top-level object with 'apps' array property 
 * - Anything else results in []
 * Provides full diagnostics to console on parsing logic.
 */
function extractAppsArray(data) {
  if (Array.isArray(data)) {
    console.log("[Analytics Diagnostics] Detected root-level array in app.json.");
    // Validate all elements are objects (could be strict, or just warn)
    if (data.length && typeof data[0] === "object") {
      return data;
    } else {
      console.warn(
        "[Analytics Diagnostics] Root array in app.json does not appear to be a list of app objects."
      );
      return [];
    }
  }
  if (data && typeof data === "object" && Array.isArray(data.apps)) {
    console.log("[Analytics Diagnostics] Detected 'apps' array in app.json object.");
    return data.apps;
  }
  // Log problems if none matched
  console.error(
    "[Analytics Diagnostics] app.json was neither an array at root nor an object with an 'apps' array property.",
    data
  );
  return [];
}

const PRIMARY_COLOR = "#57b4ad"; // teal shade for charts
const SECONDARY_COLOR = "#e3f3f2";
const ACCENT_COLOR = "#1976D2";

const AnalyticsPage = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("./app.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load app.json");
        }
        return response.json();
      })
      .then((data) => {
        const loadedApps = extractAppsArray(data);
        setApps(loadedApps);
        setLoading(false);
        // Diagnostics
        console.info(`[Analytics Diagnostics] Loaded ${loadedApps.length} app entries.`);
        if (loadedApps.length)
          console.debug("[Analytics Diagnostics] Sample app entry:", loadedApps[0]);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
        console.error("[Analytics Diagnostics] Failed to load app.json:", err);
      });
  }, []);

  // Helper: Aggregate submissions per week and votes per week
  function aggregateByWeek(appsArr) {
    // weekKey = contest_week_name if exists, else formatted date fallback.
    const weekData = {};
    appsArr.forEach((app) => {
      let week =
        app.contest_week_name ||
        (app.app_created_at
          ? `Week of ${app.app_created_at.slice(0, 10)}`
          : "Unknown");

      if (!weekData[week]) {
        weekData[week] = {
          week,
          submissions: 0,
          votes: 0,
        };
      }
      weekData[week].submissions += 1;
      weekData[week].votes += typeof app.vote_count === "number" ? app.vote_count : 0;
    });

    // Return data grouped and sorted by week label (Week X numeric order or date string)
    const weekOrder = Object.keys(weekData).sort((a, b) => {
      // Try numerical extract
      const nA = parseInt(a.replace(/\D/g, ""), 10);
      const nB = parseInt(b.replace(/\D/g, ""), 10);
      if (!isNaN(nA) && !isNaN(nB)) return nA - nB;
      return a.localeCompare(b);
    });
    return weekOrder.map((key) => weekData[key]);
  }

  // Total submission/vote summary
  function renderTotals() {
    const totalSubmissions = apps.length;
    const totalVotes = apps.reduce(
      (sum, app) =>
        sum + (typeof app.vote_count === "number" ? app.vote_count : 0),
      0
    );
    return (
      <div className="summary-cards" style={{display:"flex",gap:"2rem",margin:"2rem 0",justifyContent:"center"}}>
        <div className="summary-card" style={{
          background: SECONDARY_COLOR,
          color: "#222",
          borderRadius: 12,
          padding: "1.5rem 2.5rem",
          boxShadow: "0 2px 12px rgba(80,170,160,0.06)",
          border: `2px solid ${PRIMARY_COLOR}`,
          minWidth: 190,
          textAlign: "center"
        }}>
          <div style={{fontSize:"2.2rem", color: ACCENT_COLOR, fontWeight:700}}>{totalSubmissions}</div>
          <div style={{fontWeight:500}}>Total Submissions</div>
        </div>
        <div className="summary-card" style={{
          background: SECONDARY_COLOR,
          color: "#222",
          borderRadius: 12,
          padding: "1.5rem 2.5rem",
          boxShadow: "0 2px 12px rgba(80,170,160,0.06)",
          border: `2px solid ${PRIMARY_COLOR}`,
          minWidth: 190,
          textAlign: "center"
        }}>
          <div style={{fontSize:"2.2rem", color: ACCENT_COLOR, fontWeight:700}}>{totalVotes}</div>
          <div style={{fontWeight:500}}>Total Votes</div>
        </div>
      </div>
    );
  }

  // Chart: Show weekly trend for submissions
  function renderSubmissionTrend(weekData) {
    if (weekData.length === 0) return null;
    return (
      <div className="chart-card" style={{background: "#fff", borderRadius: 12, margin: "1.5rem 0", boxShadow: "0 2px 8px #b7dfda33", padding: "1.5rem"}}>
        <h3 style={{color: PRIMARY_COLOR, marginBottom: "0.5em"}}>Submissions per Week</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" style={{fontWeight:500,fontSize:"1rem"}}/>
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="submissions" fill={PRIMARY_COLOR} name="Submissions" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Chart: Show weekly trend for votes
  function renderVoteTrend(weekData) {
    if (weekData.length === 0) return null;
    return (
      <div className="chart-card" style={{background: "#fff", borderRadius: 12, margin: "1.5rem 0", boxShadow: "0 2px 8px #b7dfda33", padding: "1.5rem"}}>
        <h3 style={{color: ACCENT_COLOR, marginBottom: "0.5em"}}>Votes per Week</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" style={{fontWeight:500,fontSize:"1rem"}}/>
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="votes" stroke={ACCENT_COLOR} strokeWidth={3} name="Votes" dot={{r:6}} activeDot={{r:9}} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Optionally: Pie chart votes breakdown per week
  function renderVotePie(weekData) {
    if (weekData.length < 2) return null;
    const COLORS = ["#1976D2", "#57b4ad", "#88cdc7", "#aedfdb", "#ccece8", "#e3f3f2","#b6dce0","#7ccbb7", "#239a91","#c2d7c2","#bef0db"];
    return (
      <div className="chart-card" style={{background:"#fff", borderRadius: 12, margin:"1.5rem 0", boxShadow: "0 2px 8px #b7dfda33", padding:"1.5rem", minWidth:320}}>
        <h3 style={{color: PRIMARY_COLOR, marginBottom:"0.5em"}}>Votes Distribution</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={weekData}
              dataKey="votes"
              nameKey="week"
              cx="50%"
              cy="50%"
              outerRadius={90}
              fill={PRIMARY_COLOR}
              label
            >
              {weekData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (loading) return <div style={{color:PRIMARY_COLOR, fontWeight:500}}>Loading analytics...</div>;
  if (error) return <div style={{color:"red"}}>Error: {error.message}</div>;

  // Prepare data for charts
  const weekData = aggregateByWeek(apps);

  return (
    <div className="analytics-page" style={{background:"#fafdff", padding:"1rem 0"}}>
      <h1 style={{color:ACCENT_COLOR, fontWeight:800, textAlign:"center", margin:"20px 0 10px"}}>Analytics Dashboard</h1>
      <div style={{maxWidth:970, margin:"0 auto"}}>
        {renderTotals()}
        {renderSubmissionTrend(weekData)}
        {renderVoteTrend(weekData)}
        {renderVotePie(weekData)}
        <div style={{textAlign:"center", color:"#748c8b", marginTop:"1.5em", opacity:0.82}}>
          <span style={{fontSize:15,letterSpacing:1}}>
            Powered by app.json | Minimal Teal Dashboard
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
