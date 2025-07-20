import React, { useEffect, useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";
import { DashboardHeader } from "./components/DashboardHeader";
import { SideNav } from "./components/SideNav";
import { FilterPanel } from "./components/FilterPanel";

export default function App() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({}); // e.g., {week: 'All', platform: 'All'}
  const [loading, setLoading] = useState(true);

  // PUBLIC_INTERFACE
  useEffect(() => {
    fetch("./appvote.json")
      .then((r) => r.json())
      .then((jsonArr) => {
        // Transform appvote.json array into {votes: [...]} shape for widgets
        const apps = Array.isArray(jsonArr) ? jsonArr : [];
        // Map "votes" to expected dashboard shape, using what is available
        const votes = apps.map(a => ({
          appId: a.app_id,
          appName: a.app_name,
          appImage: a.image_url,
          appLink: a.app_link,
          appDescription: (a.feature_list || a.unique_features || ""),
          voteCount: a.vote_count || 0,
          week: a.contest_week_name || "All",
          platform: "Web", // Hardcode as 'Web' (customize if platform breakdown ever appears)
          anonUser: a.username || a.registration_number || (a.profile_id ? a.profile_id.substring(0, 8) : ""),
          npsScore: null,
          features: a.feature_list && typeof a.feature_list === "string"
            ? a.feature_list.split(/[,\\n]/).map(s => s.trim()).filter(Boolean) : [],
          featureRequests: [], // Not present in schema
          generalComments: [], // Not present in schema
        }));
        setData({ votes, appsRaw: apps });
        setLoading(false);
      });
  }, []);

  // PUBLIC_INTERFACE
  const handleFilterChange = (newFilters) => {
    setFilters((oldFilters) => ({ ...oldFilters, ...newFilters }));
  };

  return (
    <div className="root-oceanic-dashboard">
      <SideNav />
      <div className="main-section">
        <DashboardHeader />
        <FilterPanel data={data} filters={filters} onChange={handleFilterChange} />
        <div className="dashboard-content">
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <Dashboard data={data} filters={filters} />
          )}
        </div>
      </div>
    </div>
  );
}
