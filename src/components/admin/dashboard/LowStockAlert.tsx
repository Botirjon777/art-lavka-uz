import Link from "next/link";
import { FiAlertTriangle } from "react-icons/fi";

interface LowStockAlertProps {
  lowStockItems: Array<{
    productId: string;
    productName: string;
    allSizes: Record<string, number>;
  }>;
}

export default function LowStockAlert({ lowStockItems }: LowStockAlertProps) {
  if (lowStockItems.length === 0) return null;

  const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-6">
        <FiAlertTriangle className="w-5 h-5 text-orange-500" />
        <h2 className="text-xl font-bold text-gray-800">
          Низкий запас товаров
        </h2>
        <span className="text-sm text-gray-500">({lowStockItems.length})</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                Продукт
              </th>
              {allSizes.map((size) => (
                <th
                  key={size}
                  className="text-center py-3 px-3 font-semibold text-gray-700 text-sm"
                >
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lowStockItems.map((item, index) => (
              <tr
                key={item.productId}
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  index % 2 === 0 ? "" : "bg-gray-50/30"
                }`}
              >
                <td className="py-3 px-4">
                  <Link
                    href={`/admin/products/${item.productId}/edit`}
                    className="text-sm font-medium text-gray-800 hover:text-[#8814B1] hover:underline"
                  >
                    {item.productName}
                  </Link>
                </td>
                {allSizes.map((size) => {
                  const quantity = item.allSizes?.[size] || 0;
                  const isCritical = quantity <= 3;
                  const isLow = quantity > 3 && quantity <= 5;

                  return (
                    <td
                      key={size}
                      className={`text-center py-3 px-3 text-sm font-medium ${
                        isCritical
                          ? "bg-red-100 text-red-700"
                          : isLow
                          ? "bg-yellow-100 text-yellow-700"
                          : "text-gray-600"
                      }`}
                    >
                      {quantity}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
