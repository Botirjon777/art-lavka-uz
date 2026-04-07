"use client";

import { useAdminDashboardData } from "../hooks/useDashboard";
import StatsCards from "./StatsCards";
import LowStockAlert from "./LowStockAlert";
import SalesOverview from "./SalesOverview";
import AnalyticsCharts from "./AnalyticsCharts";
import QuickActions from "./QuickActions";
import Loader from "@/components/Loader";

export default function Dashboard() {
  const { data, isLoading: loading } = useAdminDashboardData();

  if (loading || !data) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Панель управления
        </h1>
        <Loader />
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
