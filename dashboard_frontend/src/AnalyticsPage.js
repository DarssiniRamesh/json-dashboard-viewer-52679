import React, { useEffect, useState } from "react";
import "./AnalyticsPage.css";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// PUBLIC_INTERFACE
/**
 * AnalyticsPage displays weekly summary and totals for submissions and votes using interactive charts.
 * Data source: app.json
 */
function AnalyticsPage() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [totals, setTotals] = useState({ submissions: 0, votes: 0, weeks: 0, start: "", end: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("./app.json")
      .then((res) => res.json())
      .then((data) => {
        // app.json contains an array of apps/submissions with vote info and date fields.
        // Example: { app_id, app_name, vote_count, app_created_at, contest_week_name, ... }
        processAnalyticsData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function processAnalyticsData(items) {
    // Tries to group by contest week (if available), else by created week number
    function getWeekKey(item) {
      if (item.contest_week_name) return item.contest_week_name;
      // fallback: ISO YYYY-WW from a date field
      const dateStr =
        item.app_created_at ||
        item.createdAt ||
        item.updatedAt ||
        item.start_date ||
        item.end_date;
      if (!dateStr) return "Unknown";
      const dt = new Date(dateStr);
      const jan1 = new Date(dt.getFullYear(), 0, 1);
      const days = Math.floor((dt - jan1) / 86400000);
      const week = Math.ceil((days + jan1.getDay() + 1) / 7);
      return `${dt.getFullYear()}-W${String(week).padStart(2, "0")}`;
    }
    const weekData = {};
    let totalSubmissions = 0;
    let totalVotes = 0;
    let minDate = null,
      maxDate = null;

    // Use vote_count from app.json as the true vote field
    for (const item of items) {
      // Use app_created_at or any other available date for time grouping/reporting
      const dateStr =
        item.app_created_at || item.createdAt || item.updatedAt || item.start_date || item.end_date;
      if (!dateStr) continue;
      const weekKey = getWeekKey(item);
      if (!weekData[weekKey]) weekData[weekKey] = { week: weekKey, submissions: 0, votes: 0 };
      weekData[weekKey].submissions += 1;
      weekData[weekKey].votes += Number(item.vote_count ?? 0);

      totalSubmissions += 1;
      totalVotes += Number(item.vote_count ?? 0);

      // Track earliest/latest date for reporting
      const d = new Date(dateStr);
      if (!minDate || d < minDate) minDate = d;
      if (!maxDate || d > maxDate) maxDate = d;
    }

    // Fill in missing weeks (or contest weeks) for a nicer chart
    let weekList = [];
    if (Object.keys(weekData).length > 0) {
      weekList = Object.values(weekData).sort((a, b) => (a.week > b.week ? 1 : -1));
    }

    setWeeklyData(weekList);
    setTotals({
      submissions: totalSubmissions,
      votes: totalVotes,
      weeks: weekList.length,
      start: minDate ? minDate.toISOString().slice(0, 10) : "",
      end: maxDate ? maxDate.toISOString().slice(0, 10) : "",
    });
  }

  if (loading) {
    return <div className="analytics-loading">Loading Analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <h2 className="analytics-title">Analytics Overview</h2>
      <div className="totals-card">
        <div>
          <span className="totals-label">Total Submissions:</span>{" "}
          <span className="totals-value">{totals.submissions}</span>
        </div>
        <div>
          <span className="totals-label">Total Votes:</span>{" "}
          <span className="totals-value">{totals.votes}</span>
        </div>
        <div>
          <span className="totals-label">Weeks:</span>{" "}
          <span className="totals-value">{totals.weeks}</span>
        </div>
        {totals.start && totals.end && (
          <div>
            <span className="totals-label">From:</span>{" "}
            <span className="totals-value">{totals.start}</span>
            <span className="totals-label" style={{ marginLeft: 12 }}>To:</span>{" "}
            <span className="totals-value">{totals.end}</span>
          </div>
        )}
      </div>
      <div className="charts-container">
        <div className="chart-section">
          <h3 className="chart-section-title">Submissions by Week</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="submissions" fill="#14b8a6" name="Submissions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-section">
          <h3 className="chart-section-title">Votes by Week</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="votes" stroke="#115e59" name="Votes" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="chart-footer-tip">
        <span>Tip: Hover over chart bars/lines for details.</span>
      </div>
    </div>
  );
}

export default AnalyticsPage;
