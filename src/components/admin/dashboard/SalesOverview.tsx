import {
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiPackage,
} from "react-icons/fi";

interface SalesOverviewProps {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalItemsSold: number;
  };
}

export default function SalesOverview({ overview }: SalesOverviewProps) {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Статистика продаж
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-[20px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Общая выручка</p>
            <FiDollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {overview.totalRevenue.toLocaleString()} UZS
          </p>
        </div>

        <div className="bg-white rounded-[20px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Всего заказов</p>
            <FiShoppingCart className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {overview.totalOrders}
          </p>
        </div>

        <div className="bg-white rounded-[20px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Средний чек</p>
            <FiTrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {Math.round(overview.averageOrderValue).toLocaleString()} UZS
          </p>
        </div>

        <div className="bg-white rounded-[20px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Товаров продано</p>
            <FiPackage className="w-5 h-5 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {overview.totalItemsSold}
          </p>
        </div>
      </div>
    </>
  );
}
