"use client";

import { BTS_CITIES, BTS_ZONE_MATRIX } from "@/lib/deliveryDataBTS";
import { useState } from "react";

const ZONE_COLORS = [
  "bg-emerald-100 text-emerald-800", // Zone 0
  "bg-green-100 text-green-800",   // Zone 1
  "bg-amber-50 text-amber-800",    // Zone 2
  "bg-orange-100 text-orange-800", // Zone 3
  "bg-red-50 text-red-800",       // Zone 4
  "bg-red-100 text-red-900",      // Zone 5
];

export default function ZoneTable() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Матрица зон BTS Express</h2>
          <p className="text-sm text-gray-500">Зоны определяются на пересечении города отправления и прибытия</p>
        </div>
        <div className="flex gap-2">
          {ZONE_COLORS.map((color, i) => (
             <div key={i} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${color}`}>
               Зона {i}
             </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 bg-gray-50 border border-gray-100 text-left text-[10px] uppercase font-black text-gray-400 min-w-[120px]">
                Откуда \ Куда
              </th>
              {BTS_CITIES.map((city, idx) => (
                <th 
                  key={city} 
                  className={`p-3 border border-gray-100 text-center text-[10px] uppercase font-black transition-colors ${
                    hoveredCol === idx ? "bg-purple-50 text-[#8814B1]" : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {city}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BTS_CITIES.map((departureCity, rowIdx) => (
              <tr 
                key={departureCity} 
                onMouseEnter={() => setHoveredRow(rowIdx)} 
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className={`p-3 border border-gray-100 font-bold text-sm transition-colors ${
                  hoveredRow === rowIdx ? "bg-purple-50 text-[#8814B1]" : "text-gray-700"
                }`}>
                  {departureCity}
                </td>
                {BTS_ZONE_MATRIX[rowIdx].map((zone, colIdx) => (
                  <td 
                    key={colIdx} 
                    onMouseEnter={() => setHoveredCol(colIdx)}
                    onMouseLeave={() => setHoveredCol(null)}
                    className={`p-3 border border-gray-100 text-center font-black text-xs transition-all cursor-default ${
                      hoveredCol === colIdx || hoveredRow === rowIdx ? "opacity-100" : "opacity-90"
                    } ${ZONE_COLORS[zone]} ${
                      hoveredCol === colIdx && hoveredRow === rowIdx ? "ring-2 ring-purple-400 scale-110 z-10 relative shadow-lg" : ""
                    }`}
                  >
                    {zone}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
