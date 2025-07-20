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
        // Assuming app.json contains a flat array of submissions with vote info and created/updated date.
        // Example submission: {id, title, votes, createdAt: "2024-06-10", ...}
        processAnalyticsData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function processAnalyticsData(items) {
    // Map each submission to week number (YYYY-WW)
    function getWeekKey(dateStr) {
      const dt = new Date(dateStr);
      // Get ISO week
      const jan1 = new Date(dt.getFullYear(), 0, 1);
      const days = Math.floor((dt - jan1) / 86400000);
      const week = Math.ceil((days + jan1.getDay() + 1) / 7);
      return `${dt.getFullYear()}-W${String(week).padStart(2, "0")}`;
    }
    const weekData = {};
    let totalSubmissions = 0;
    let totalVotes = 0;
    let minDate = null, maxDate = null;

    // This assumes each item has votes (format: integer), createdAt and/or updatedAt
    for (const item of items) {
      const dateStr = item.createdAt || item.updatedAt;
      if (!dateStr) continue;
      const weekKey = getWeekKey(dateStr);
      if (!weekData[weekKey]) weekData[weekKey] = { week: weekKey, submissions: 0, votes: 0 };
      weekData[weekKey].submissions += 1;
      weekData[weekKey].votes += (item.votes ?? 0);

      totalSubmissions += 1;
      totalVotes += (item.votes ?? 0);

      // Track earliest/latest date for reporting
      const d = new Date(dateStr);
      if (!minDate || d < minDate) minDate = d;
      if (!maxDate || d > maxDate) maxDate = d;
    }
    // Fill in missing weeks in range for a nicer chart
    let weekList = [];
    if (minDate && maxDate) {
      let dt = new Date(minDate.getTime());
      while (dt <= maxDate) {
        const weekKey = getWeekKey(dt.toISOString().slice(0, 10));
        if (!weekData[weekKey]) weekData[weekKey] = { week: weekKey, submissions: 0, votes: 0 };
        dt.setDate(dt.getDate() + 7);
      }
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
