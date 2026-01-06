"use client";

import { ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiShoppingBag,
  FiImage,
  FiGrid,
  FiLogOut,
  FiShoppingCart,
} from "react-icons/fi";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: FiHome },
    { name: "Products", href: "/admin/products", icon: FiShoppingBag },
    { name: "Orders", href: "/admin/orders", icon: FiShoppingCart },
    { name: "Prints", href: "/admin/prints", icon: FiImage },
    { name: "Gallery", href: "/admin/gallery", icon: FiGrid },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  // If user is not authenticated and not on login page, don't show sidebar
  const isLoginPage = pathname === "/admin/login";
  const showSidebar = session && !isLoginPage;

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Sidebar - only show when authenticated and not on login page */}
      {showSidebar && (
        <aside className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-[#8814B1]">Art Lavka</h1>
            <p className="text-sm text-gray-600 mt-1">Admin Panel</p>
          </div>

          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive(item.href)
                      ? "bg-[#8814B1] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
            <div className="mb-3 px-4">
              <p className="text-sm font-medium text-gray-700">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 p-8 overflow-y-auto ${!showSidebar ? "w-full" : ""}`}
      >
        {children}
      </main>
    </div>
  );
}
