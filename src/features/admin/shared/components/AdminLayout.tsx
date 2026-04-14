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
  FiSettings,
  FiTrendingUp,
} from "react-icons/fi";
import Loader from "@/components/Loader";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const navigation = [
    { name: "Панель управления", href: "/admin", icon: FiHome },
    { name: "Продукты", href: "/admin/products", icon: FiShoppingBag },
    { name: "Заказы", href: "/admin/orders", icon: FiShoppingCart },
    {
      name: "Категории принтов",
      href: "/admin/prints/categories",
      icon: FiGrid,
    },
    { name: "Принты", href: "/admin/prints", icon: FiImage },
    { name: "Галерея", href: "/admin/gallery", icon: FiGrid },
    { name: "Публикации", href: "/admin/publications", icon: FiTrendingUp },
    { name: "Настройки", href: "/admin/settings", icon: FiSettings },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }

    if (pathname === href) return true;

    if (pathname?.startsWith(href + "/")) {
      const otherMatchingNav = navigation.find(
        (item) => item.href !== href && pathname === item.href,
      );
      return !otherMatchingNav;
    }

    return false;
  };

  const isLoginPage = pathname === "/admin/login";

  // While next-auth is resolving show a full-page branded loader
  if (status === "loading" && !isLoginPage) {
    return <Loader fullPage />;
  }

  const showSidebar = session && !isLoginPage;

  return (
    <div className="h-screen bg-[#F5F5F5] flex overflow-hidden">
      {/* Sidebar — only shown when authenticated and not on the login page */}
      {showSidebar && (
        <aside className="w-72 bg-white shadow-lg flex flex-col shrink-0 h-full">
          <div className="p-6 border-b border-gray-200 shrink-0">
            <h1 className="text-2xl font-bold text-[#8814B1]">Art Lavka</h1>
            <p className="text-sm text-gray-600 mt-1">Админ панель</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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

          <div className="p-4 border-t border-gray-200 shrink-0">
            <div className="mb-3 px-4">
              <p className="text-sm font-medium text-gray-700 truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="font-medium">Выйти</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
