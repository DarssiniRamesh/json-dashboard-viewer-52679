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
      .then((json) => {
        setData(json);
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
