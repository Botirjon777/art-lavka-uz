"use server";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function getSalesAnalytics(startDate?: Date, endDate?: Date) {
  try {
    await dbConnect();

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = startDate;
      if (endDate) dateFilter.createdAt.$lte = endDate;
    }

    const orders = await Order.find(dateFilter).lean();

    // Sales Overview
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalItemsSold = orders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (itemSum: number, item: any) => itemSum + item.quantity,
          0
        ),
      0
    );

    // Sales by Size
    const salesBySize: Record<string, number> = {};
    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        const size = item.size || "Unknown";
        salesBySize[size] = (salesBySize[size] || 0) + item.quantity;
      });
    });

    // Sales by Category
    const salesByCategory: Record<string, number> = {};
    orders.forEach((order) => {
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
    orders.forEach((order) => {
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
    orders.forEach((order) => {
      const day = dayNames[new Date(order.createdAt).getDay()];
      salesByDay[day] += order.totalAmount;
    });

    // Sales by Hour
    const salesByHour: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      salesByHour[i] = 0;
    }
    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      salesByHour[hour] += order.totalAmount;
    });

    // Sales Trend (Last 30 days)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const salesTrend: Record<string, number> = {};

    orders
      .filter((order) => new Date(order.createdAt) >= last30Days)
      .forEach((order) => {
        const date = new Date(order.createdAt).toISOString().split("T")[0];
        salesTrend[date] = (salesTrend[date] || 0) + order.totalAmount;
      });

    return {
      success: true,
      analytics: {
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
      },
    };
  } catch (error: any) {
    console.error("Error fetching sales analytics:", error);
    return {
      success: false,
      error: "Failed to fetch analytics data",
    };
  }
}
