"use client";

import { useState, useEffect } from "react";
import { getAdminStats } from "@/app/actions/stats";
import Link from "next/link";
import { FiShoppingBag, FiImage, FiGrid, FiPlus } from "react-icons/fi";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    products: 0,
    prints: 0,
    gallery: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const result = await getAdminStats();
      if (result.success && result.stats) {
        setCounts(result.stats);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  const stats = [
    {
      name: "Products",
      value: counts.products.toString(),
      icon: FiShoppingBag,
      href: "/admin/products",
      color: "bg-blue-500",
    },
    {
      name: "Prints",
      value: counts.prints.toString(),
      icon: FiImage,
      href: "/admin/prints",
      color: "bg-purple-500",
    },
    {
      name: "Gallery Items",
      value: counts.gallery.toString(),
      icon: FiGrid,
      href: "/admin/gallery",
      color: "bg-cyan-500",
    },
  ];

  const quickActions = [
    { name: "Add Product", href: "/admin/products/new", icon: FiPlus },
    { name: "Add Print", href: "/admin/prints/new", icon: FiPlus },
    { name: "Manage Gallery", href: "/admin/gallery", icon: FiGrid },
  ];

  return (
    <div className="max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {loading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[20px] p-6 shadow-sm animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-10 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="bg-gray-200 w-14 h-14 rounded-xl"></div>
                </div>
              </div>
            ))
          : stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.name}
                  href={stat.href}
                  className="bg-white rounded-[20px] p-6 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.color} p-4 rounded-xl`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-[20px] p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                href={action.href}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-[#8814B1] hover:bg-[#8814B1]/5 transition-all"
              >
                <div className="bg-[#8814B1] p-2 rounded-lg">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700">{action.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
