"use client";

import { useState, useEffect, useCallback } from "react";
import { getDeliverySettings, updateRegionZones } from "../actions/deliveryPrices";
import { FiRefreshCcw, FiSave } from "react-icons/fi";

const ZONE_COLORS = [
  "bg-emerald-100 text-emerald-800 border-emerald-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-amber-50 text-amber-800 border-amber-200",
  "bg-orange-100 text-orange-800 border-orange-200",
  "bg-red-50 text-red-800 border-red-200",
  "bg-red-100 text-red-900 border-red-300",
];

const ZONE_LABELS = ["0 — Местная", "1 — Ближняя", "2 — Средняя", "3 — Дальняя", "4 — Очень дальняя", "5 — Максимальная"];

export default function RegionZoneEditor() {
  const [zones, setZones] = useState<Record<string, number> | null>(null);
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await getDeliverySettings();
    if (result.success && result.regionZones) {
      setZones(result.regionZones);
      setDraft(result.regionZones);
      setDirty(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (region: string, zone: number) => {
    setDraft((prev) => ({ ...prev, [region]: zone }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await updateRegionZones(draft);
    if (res.success) {
      setZones(draft);
      setDirty(false);
    }
    setSaving(false);
  };

  const handleReset = () => {
    if (zones) {
      setDraft(zones);
      setDirty(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[32px] p-20 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4">
        <FiRefreshCcw className="animate-spin text-purple-600" size={32} />
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Загрузка зон...</p>
      </div>
    );
  }

  const regions = Object.keys(draft).sort();

  return (
    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Зоны по регионам</h2>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Отправление из Ферганы — укажите зону BTS для каждого региона
          </p>
        </div>
        <div className="flex gap-3">
          {dirty && (
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
            >
              Сбросить
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#8814B1] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100"
          >
            {saving ? <FiRefreshCcw className="animate-spin" size={14} /> : <FiSave size={14} />}
            Сохранить
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {ZONE_COLORS.map((color, i) => (
          <span key={i} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${color}`}>
            Зона {i}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {regions.map((region) => {
          const zone = draft[region] ?? 1;
          return (
            <div
              key={region}
              className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-purple-100 transition-colors gap-3"
            >
              <span className="text-sm font-bold text-gray-700 flex-1 min-w-0 truncate">{region}</span>
              <select
                value={zone}
                onChange={(e) => handleChange(region, Number(e.target.value))}
                className={`shrink-0 text-xs font-black px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all ${ZONE_COLORS[zone]}`}
              >
                {ZONE_LABELS.map((label, idx) => (
                  <option key={idx} value={idx}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {dirty && (
        <p className="mt-4 text-xs text-amber-600 font-bold text-center">
          Есть несохранённые изменения — нажмите «Сохранить»
        </p>
      )}
    </div>
  );
}
