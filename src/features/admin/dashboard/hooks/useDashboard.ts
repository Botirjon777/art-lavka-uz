import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "../actions/stats";
import { getSalesAnalytics } from "../actions/analytics";
import { getLowStockProducts } from "../actions/lowStock";

export const useAdminDashboardData = () => {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      try {
        const [statsResult, analyticsResult, lowStockResult] =
          await Promise.all([
            getAdminStats(),
            getSalesAnalytics(),
            getLowStockProducts(5),
          ]);

        return {
          counts:
            statsResult.success && statsResult.stats
              ? statsResult.stats
              : { products: 0, prints: 0, gallery: 0 },
          analytics:
            analyticsResult.success && analyticsResult.analytics
              ? analyticsResult.analytics
              : null,
          lowStockItems:
            lowStockResult.success && lowStockResult.lowStockItems
              ? lowStockResult.lowStockItems
              : [],
        };
      } catch (error) {
        console.error("Dashboard data fetch failed:", error);
        return {
          counts: { products: 0, prints: 0, gallery: 0 },
          analytics: null,
          lowStockItems: [],
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard stats
  });
};
