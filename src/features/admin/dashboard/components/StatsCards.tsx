import Link from "next/link";
import { FiShoppingBag, FiImage, FiGrid } from "react-icons/fi";

interface StatsCardsProps {
  counts: {
    products: number;
    prints: number;
    gallery: number;
  };
}

export default function StatsCards({ counts }: StatsCardsProps) {
  const stats = [
    {
      name: "Продукты",
      value: counts.products.toString(),
      icon: FiShoppingBag,
      href: "/admin/products",
      color: "bg-blue-500",
    },
    {
      name: "Принты",
      value: counts.prints.toString(),
      icon: FiImage,
      href: "/admin/prints",
      color: "bg-purple-500",
    },
    {
      name: "Галерея",
      value: counts.gallery.toString(),
      icon: FiGrid,
      href: "/admin/gallery",
      color: "bg-cyan-500",
    },
  ];

  return (
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
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-4 rounded-xl`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
