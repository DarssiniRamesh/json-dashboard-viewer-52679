import React from "react";

// PUBLIC_INTERFACE
export function FilterPanel({ data, filters, onChange }) {
  if (!data) return null;

  // Find all unique weeks and platforms, etc
  const weekSet = new Set();
  const platformSet = new Set();
  data.votes?.forEach((v) => {
    if (v.week) weekSet.add(v.week);
    if (v.platform) platformSet.add(v.platform);
  });

  const weeks = [...weekSet].sort();
  const platforms = ["All", ...[...platformSet].sort()];

  // PUBLIC_INTERFACE
  const handleSelect = (e) => {
    onChange({ [e.target.name]: e.target.value });
  };

  return (
    <form className="filter-panel" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="filter-week">Week:</label>
      <select
        name="week"
        id="filter-week"
        value={filters.week || "All"}
        onChange={handleSelect}
      >
        <option value="All">All</option>
        {weeks.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>
      <label htmlFor="filter-platform">Platform:</label>
      <select
        name="platform"
        id="filter-platform"
        value={filters.platform || "All"}
        onChange={handleSelect}
      >
        {platforms.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </form>
  );
}
