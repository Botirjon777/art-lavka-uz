"use client";

import Link from "next/link";
import { FiShoppingBag, FiImage, FiGrid, FiPlus } from "react-icons/fi";

export default function AdminDashboard() {
  const stats = [
    {
      name: "Products",
      value: "0",
      icon: FiShoppingBag,
      href: "/admin/products",
      color: "bg-blue-500",
    },
    {
      name: "Prints",
      value: "0",
      icon: FiImage,
      href: "/admin/prints",
      color: "bg-purple-500",
    },
    {
      name: "Gallery Items",
      value: "0",
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
        {stats.map((stat) => {
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
