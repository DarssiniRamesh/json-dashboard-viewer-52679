import React from "react";
import { StatsSummary } from "./components/StatsSummary";
import { TopAppsWidget } from "./components/TopAppsWidget";
import { OutcomeSummary } from "./components/OutcomeSummary";
import { WeekByWeekChart } from "./components/WeekByWeekChart";
import { WordCloudWidget } from "./components/WordCloudWidget";
import { FeatureSentenceCloud } from "./components/FeatureSentenceCloud";
import { PlatformDistributionChart } from "./components/PlatformDistributionChart";
import { SubmissionStats } from "./components/SubmissionStats";

// PUBLIC_INTERFACE
export default function Dashboard({ data, filters }) {
  if (!data) return null;

  return (
    <div className="dashboard-grid">
      <StatsSummary data={data} filters={filters} />
      <SubmissionStats data={data} filters={filters} />
      <PlatformDistributionChart data={data} filters={filters} />
      <TopAppsWidget data={data} filters={filters} />
      <OutcomeSummary data={data} filters={filters} />
      <WordCloudWidget data={data} filters={filters} />
      <FeatureSentenceCloud data={data} filters={filters} />
      <WeekByWeekChart data={data} filters={filters} />
    </div>
  );
}
