import React from "react";
import { StatsSummary } from "./components/StatsSummary";
import { TopAppsWidget } from "./components/TopAppsWidget";
import { OutcomeSummary } from "./components/OutcomeSummary";
import { WeekByWeekChart } from "./components/WeekByWeekChart";
import { WordCloudWidget } from "./components/WordCloudWidget";
import { FeatureSentenceCloud } from "./components/FeatureSentenceCloud";
import { PlatformDistributionChart } from "./components/PlatformDistributionChart";
import { SubmissionStats } from "./components/SubmissionStats";

/**
 * PUBLIC_INTERFACE
 * Dashboard: Main dashboard, passes data to all widgets (adapted to new appvote.json schema).
 */
export default function Dashboard({ data, filters }) {
  if (!data) return null;
  // Note: some widgets may be limited if certain fields are missing.

  return (
    <div className="dashboard-grid">
      <StatsSummary data={data} filters={filters} />
      <SubmissionStats data={data} filters={filters} />
      <PlatformDistributionChart data={data} filters={filters} />
      <TopAppsWidget data={data} filters={filters} />
      {/* Placeholders or disabled blocks for widgets that can't function due to lack of vote data (comments, NPS, etc) may be considered, but we retain the skeleton for structure */}
      {/* If meaningful, OutcomeSummary, WordCloudWidget, etc., could be customized to use app_name, feature_list, etc. */}
      <OutcomeSummary data={data} filters={filters} />
      <WordCloudWidget data={data} filters={filters} />
      <FeatureSentenceCloud data={data} filters={filters} />
      <WeekByWeekChart data={data} filters={filters} />
    </div>
  );
}
