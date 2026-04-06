"use client";

import { useState, useEffect } from "react";
import { getSalesAnalytics } from "../actions/analytics";
import { getAdminStats } from "../actions/stats";
import { getLowStockProducts } from "../actions/lowStock";
import StatsCards from "./StatsCards";
import LowStockAlert from "./LowStockAlert";
import SalesOverview from "./SalesOverview";
import AnalyticsCharts from "./AnalyticsCharts";
import QuickActions from "./QuickActions";

export default function Dashboard() {
  const [counts, setCounts] = useState({
    products: 0,
    prints: 0,
    gallery: 0,
  });
  const [analytics, setAnalytics] = useState<any>(null);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [statsResult, analyticsResult, lowStockResult] = await Promise.all([
        getAdminStats(),
        getSalesAnalytics(),
        getLowStockProducts(5),
      ]);

      if (statsResult.success && statsResult.stats) {
        setCounts(statsResult.stats);
      }

      if (analyticsResult.success && analyticsResult.analytics) {
        setAnalytics(analyticsResult.analytics);
      }

      if (lowStockResult.success && lowStockResult.lowStockItems) {
        setLowStockItems(lowStockResult.lowStockItems);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
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
