"use server";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { unstable_cache } from "next/cache";

const fetchSalesAnalytics = async (startDate?: Date, endDate?: Date) => {
  await dbConnect();

  const dateFilter: any = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = startDate;
    if (endDate) dateFilter.createdAt.$lte = endDate;
  }

  const orders = await Order.find(dateFilter).lean();

  // Sales Overview
  const totalRevenue = (orders as any[]).reduce(
    (sum: number, order: any) => sum + order.totalAmount,
    0
  );
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalItemsSold = (orders as any[]).reduce(
    (sum: number, order: any) =>
      sum +
      order.items.reduce(
        (itemSum: number, item: any) => itemSum + item.quantity,
        0
      ),
    0
  );

  // Sales by Size
  const salesBySize: Record<string, number> = {};
  (orders as any[]).forEach((order: any) => {
    order.items.forEach((item: any) => {
      const size = item.size || "Unknown";
      salesBySize[size] = (salesBySize[size] || 0) + item.quantity;
    });
  });

  // Sales by Category
  const salesByCategory: Record<string, number> = {};
  (orders as any[]).forEach((order: any) => {
    order.items.forEach((item: any) => {
      const category = item.product?.category || "Unknown";
      salesByCategory[category] =
        (salesByCategory[category] || 0) + item.quantity;
    });
  });

  // Popular Prints
  const printsSales: Record<
    string,
    { name: string; count: number; revenue: number }
  > = {};
  (orders as any[]).forEach((order: any) => {
    order.items.forEach((item: any) => {
      if (item.print && item.print.name) {
        const printName = item.print.name;
        if (!printsSales[printName]) {
          printsSales[printName] = { name: printName, count: 0, revenue: 0 };
        }
        printsSales[printName].count += item.quantity;
        printsSales[printName].revenue += item.price * item.quantity;
      }
    });
  });
  const popularPrints = Object.values(printsSales)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Sales by Day of Week
  const salesByDay: Record<string, number> = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  (orders as any[]).forEach((order: any) => {
    const day = dayNames[new Date(order.createdAt).getDay()];
    salesByDay[day] += order.totalAmount;
  });

  // Sales by Hour
  const salesByHour: Record<number, number> = {};
  for (let i = 0; i < 24; i++) {
    salesByHour[i] = 0;
  }
  (orders as any[]).forEach((order: any) => {
    const hour = new Date(order.createdAt).getHours();
    salesByHour[hour] += order.totalAmount;
  });

  // Sales Trend (Last 30 days)
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const salesTrend: Record<string, number> = {};

  (orders as any[])
    .filter((order: any) => new Date(order.createdAt) >= last30Days)
    .forEach((order: any) => {
      const date = new Date(order.createdAt).toISOString().split("T")[0];
      salesTrend[date] = (salesTrend[date] || 0) + order.totalAmount;
    });

  // Sales by Region
  const uzbekistanRegions = [
    "город Ташкент",
    "Ташкентская область",
    "Андижанская область",
    "Бухарская область",
    "Ферганская область",
    "Джизакская область",
    "Хорезмская область",
    "Наманганская область",
    "Навоийская область",
    "Кашкадарьинская область",
    "Республика Каракалпакстан",
    "Самаркандская область",
    "Сырдарьинская область",
    "Сурхандарьинская область",
  ];

  // Initialize all regions with 0 values
  const salesByRegion: Record<
    string,
    { region: string; revenue: number; orders: number }
  > = {};

  uzbekistanRegions.forEach((region) => {
    salesByRegion[region] = { region, revenue: 0, orders: 0 };
  });

  // Populate with actual sales data
  (orders as any[]).forEach((order: any) => {
    const region = order.region || "Unknown";
    if (!salesByRegion[region]) {
      salesByRegion[region] = { region, revenue: 0, orders: 0 };
    }
    salesByRegion[region].revenue += order.totalAmount;
    salesByRegion[region].orders += 1;
  });

  return {
    overview: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalItemsSold,
    },
    salesBySize: Object.entries(salesBySize).map(([size, count]) => ({
      size,
      count,
    })),
    salesByCategory: Object.entries(salesByCategory).map(
      ([category, count]) => ({
        category,
        count,
      })
    ),
    popularPrints,
    salesByDay: Object.entries(salesByDay).map(([day, revenue]) => ({
      day,
      revenue,
    })),
    salesByHour: Object.entries(salesByHour).map(([hour, revenue]) => ({
      hour: parseInt(hour),
      revenue,
    })),
    salesTrend: Object.entries(salesTrend)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    salesByRegion: Object.values(salesByRegion).sort(
      (a, b) => b.revenue - a.revenue
    ),
  };
};

const getCachedSalesAnalytics = unstable_cache(
  async (startDateString?: string, endDateString?: string) => {
    const startDate = startDateString ? new Date(startDateString) : undefined;
    const endDate = endDateString ? new Date(endDateString) : undefined;
    return fetchSalesAnalytics(startDate, endDate);
  },
  ["sales-analytics"],
  { revalidate: 300, tags: ["sales-analytics"] }
);

export async function getSalesAnalytics(startDate?: Date, endDate?: Date) {
  try {
    const stats = await getCachedSalesAnalytics(
      startDate?.toISOString(),
      endDate?.toISOString()
    );

    return {
      success: true,
      analytics: stats,
    };
  } catch (error: any) {
    console.error("Error fetching sales analytics:", error);
    return {
      success: false,
      error: "Failed to fetch analytics data",
    };
  }
}
