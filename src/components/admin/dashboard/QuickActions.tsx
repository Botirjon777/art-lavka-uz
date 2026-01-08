import Link from "next/link";
import { FiPlus, FiGrid } from "react-icons/fi";

export default function QuickActions() {
  const quickActions = [
    { name: "Добавить продукт", href: "/admin/products/new", icon: FiPlus },
    { name: "Добавить принт", href: "/admin/prints/new", icon: FiPlus },
    { name: "Управление галереей", href: "/admin/gallery", icon: FiGrid },
  ];

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Быстрые действия</h2>
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
  );
}
