"use client";

import { BTS_PRICES } from "@/lib/deliveryDataBTS";

export default function PriceTable() {
  const weights = Object.keys(BTS_PRICES).map(Number).sort((a,b) => a-b);

  return (
    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm overflow-hidden">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Стоимость по весу и зонам</h2>
        <p className="text-sm text-gray-500">Тарифы (UZS) для почтовых отправлений до 20 кг (от офиса до офиса)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 bg-gray-50 border border-gray-100 text-left text-[10px] uppercase font-black text-gray-400">
                Вес (кг)
              </th>
              {[0, 1, 2, 3, 4, 5].map((zone) => (
                <th key={zone} className="p-4 bg-gray-50 border border-gray-100 text-center text-[10px] uppercase font-black text-gray-400">
                  Зона {zone}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weights.map((weight) => (
              <tr key={weight} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 border border-gray-100 font-bold text-gray-700 text-sm">
                  {weight} кг
                </td>
                {BTS_PRICES[weight].map((price, idx) => (
                  <td key={idx} className="p-4 border border-gray-100 text-center text-sm font-medium text-gray-600">
                    {price.toLocaleString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
        <h4 className="text-sm font-bold text-blue-800 mb-2">Дополнительные сборы (Курьер):</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Приём/Доставка в черте города (1-10 кг): <strong>30,000 UZS</strong></li>
          <li>• Приём/Доставка в черте города (11-20 кг): <strong>40,000 UZS</strong></li>
        </ul>
      </div>
    </div>
  );
}
