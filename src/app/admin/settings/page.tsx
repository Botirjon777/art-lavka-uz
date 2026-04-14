"use client";

import { useState, useEffect } from "react";
import { FiSave, FiSettings, FiCheckCircle, FiClock } from "react-icons/fi";
import toast from "react-hot-toast";

type CategoryStatus = "active" | "soon";

interface SettingsData {
  categoryStatuses: {
    women: CategoryStatus;
    men: CategoryStatus;
    kids: CategoryStatus;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      toast.error("Не удалось загрузить настройки");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (category: keyof SettingsData["categoryStatuses"]) => {
    if (!settings) return;

    setSettings({
      ...settings,
      categoryStatuses: {
        ...settings.categoryStatuses,
        [category]:
          settings.categoryStatuses[category] === "active" ? "soon" : "active",
      },
    });
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Настройки сохранены");
      } else {
        toast.error("Ошибка при сохранении");
      }
    } catch (error) {
      toast.error("Произошла ошибка");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8814B1]"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiSettings className="text-[#8814B1]" />
            Глобальные настройки
          </h1>
          <p className="text-gray-500 mt-1">
            Управление видимостью категорий и другими параметрами магазина
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50"
        >
          <FiSave className="w-5 h-5" />
          {saving ? "Сохранение..." : "Сохранить изменения"}
        </button>
      </div>

      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">
            Статус категорий (Пола)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Выберите, какие категории будут доступны для выбора в конфигураторе,
            а какие будут помечены как "Скоро".
          </p>
        </div>

        <div className="p-8 space-y-6">
          {(["women", "men", "kids"] as const).map((cat) => {
            const label =
              cat === "women"
                ? "Женский"
                : cat === "men"
                  ? "Мужской"
                  : "Детский";
            const isActive = settings?.categoryStatuses[cat] === "active";

            return (
              <div
                key={cat}
                className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}
                  >
                    {isActive ? (
                      <FiCheckCircle size={24} />
                    ) : (
                      <FiClock size={24} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{label}</p>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">
                      {cat}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-medium ${isActive ? "text-green-600" : "text-orange-600"}`}
                  >
                    {isActive ? "Активно" : "Скоро"}
                  </span>
                  <button
                    onClick={() => handleToggle(cat)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${isActive ? "bg-[#8814B1]" : "bg-gray-200"}`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-7" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
