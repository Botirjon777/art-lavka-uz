"use client";

import { useAdminDashboardData } from "../hooks/useDashboard";
import StatsCards from "./StatsCards";
import LowStockAlert from "./LowStockAlert";
import SalesOverview from "./SalesOverview";
import AnalyticsCharts from "./AnalyticsCharts";
import QuickActions from "./QuickActions";

export default function Dashboard() {
  const { data, isLoading: loading } = useAdminDashboardData();

  if (loading || !data) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Панель управления
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-[20px] p-6 shadow-sm animate-pulse"
            >
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { counts, lowStockItems, analytics } = data;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Панель управления
      </h1>

      <StatsCards counts={counts} />

      <LowStockAlert lowStockItems={lowStockItems} />

      {analytics && (
        <>
          <SalesOverview overview={analytics.overview} />
          <AnalyticsCharts analytics={analytics} />
        </>
      )}

      <QuickActions />
    </div>
  );
}
