"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { Input, Button } from "@/components/ui";
import { LANGUAGES, Lang } from "@/lib/i18n";
import { toast } from "sonner";
import {
  FiSettings,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiTrash2,
  FiSave,
  FiTruck,
  FiCreditCard,
  FiBookOpen,
  FiMessageCircle,
  FiMail,
  FiInstagram,
} from "react-icons/fi";

interface Category {
  id: string;
  label: string;
  status: "active" | "soon";
  translations?: Record<string, { label: string }>;
}

interface SettingsData {
  categories: Category[];
  menu: {
    delivery: string;
    payment: string;
    about: string;
    telegram: string;
    email: string;
    instagramArtists: string;
    instagramStore: string;
    translations?: Record<
      string,
      { delivery?: string; payment?: string; about?: string }
    >;
  };
  updatedAt?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"categories" | "menu">(
    "categories",
  );
  const [activeLangTab, setActiveLangTab] = useState<Lang>("ru");

  // Category Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [catId, setCatId] = useState("");
  const [catLabel, setCatLabel] = useState<Record<string, string>>({
    ru: "",
    en: "",
    uz: "",
  });

  // Menu Draft State
  const [menuDraft, setMenuDraft] = useState<SettingsData["menu"] | null>(null);
  const [isMenuDirty, setIsMenuDirty] = useState(false);

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
        setMenuDraft(data.data.menu);
        setIsMenuDirty(false);
      }
    } catch (error) {
      toast.error("Не удалось загрузить настройки");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    if (!settings) return;

    const newCategories: Category[] = settings.categories.map((c) =>
      c.id === id
        ? { ...c, status: c.status === "active" ? "soon" : "active" }
        : c,
    );
    const updatedSettings: SettingsData = {
      ...settings,
      categories: newCategories,
    };

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      const data = await response.json();
      if (data.success) {
        setSettings(updatedSettings);
        toast.success("Статус обновлен");
      }
    } catch (error) {
      toast.error("Не удалось обновить статус");
    }
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCatId("");
    setCatLabel({ ru: "", en: "", uz: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    setCatId(category.id);
    setCatLabel({
      ru: category.label || "",
      en: category.translations?.en?.label || "",
      uz: category.translations?.uz?.label || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!settings) return;
    if (!catId.trim() || !catLabel.ru.trim()) {
      toast.error("Заполните все обязательные поля (RU)");
      return;
    }

    // Check for duplicate ID if adding new
    if (!editingCategory && settings.categories.some((c) => c.id === catId)) {
      toast.error("Категория с таким ID уже существует");
      return;
    }

    let newCategories: Category[];
    const translations = {
      en: { label: catLabel.en },
      uz: { label: catLabel.uz },
    };

    if (editingCategory) {
      // Edit
      newCategories = settings.categories.map((c) =>
        c.id === editingCategory.id
          ? { ...c, label: catLabel.ru, id: catId, translations }
          : c,
      );
    } else {
      // Add
      newCategories = [
        ...settings.categories,
        {
          id: catId,
          label: catLabel.ru,
          status: "soon" as const,
          translations,
        },
      ];
    }

    const updatedSettings: SettingsData = {
      ...settings,
      categories: newCategories,
    };

    try {
      setSaving(true);
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      const data = await response.json();
      if (data.success) {
        setSettings(updatedSettings);
        toast.success(
          editingCategory ? "Категория обновлена" : "Категория добавлена",
        );
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error("Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!settings || !categoryToDelete) return;

    const newCategories = settings.categories.filter(
      (c) => c.id !== categoryToDelete.id,
    );
    const updatedSettings = { ...settings, categories: newCategories };

    // Save immediately to ensure it works as expected
    try {
      setSaving(true);
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      const data = await response.json();
      if (data.success) {
        setSettings(updatedSettings);
        toast.success("Категория удалена");
      } else {
        toast.error("Ошибка при сохранении");
      }
    } catch (error) {
      toast.error("Произошла ошибка");
    } finally {
      setSaving(false);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleMenuDraftChange = (
    field: keyof SettingsData["menu"],
    value: string,
  ) => {
    if (!menuDraft) return;

    // Regular text fields or translatable descriptions
    if (["delivery", "payment", "about"].includes(field)) {
      const currentTranslations = { ...(menuDraft.translations || {}) };

      if (activeLangTab === "ru") {
        setMenuDraft({ ...menuDraft, [field]: value });
      } else {
        const langData = { ...(currentTranslations[activeLangTab] || {}) };
        langData[field as "delivery" | "payment" | "about"] = value;
        currentTranslations[activeLangTab] = langData;
        setMenuDraft({ ...menuDraft, translations: currentTranslations });
      }
    } else {
      setMenuDraft({ ...menuDraft, [field]: value });
    }

    setIsMenuDirty(true);
  };

  const handleSaveMenu = async () => {
    if (!settings || !menuDraft) return;

    const updatedSettings: SettingsData = {
      ...settings,
      menu: menuDraft,
    };

    try {
      setSaving(true);
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        setMenuDraft(data.data.menu);
        setIsMenuDirty(false);
        toast.success("Контент меню сохранен");
      }
    } catch (error) {
      toast.error("Ошибка при сохранении");
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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[30px] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FiSettings className="text-[#8814B1]" />
            Настройки сайта
          </h1>
          <p className="text-gray-500 mt-1">
            Управление категориями и контентом модальных окон
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === "categories"
                ? "bg-white text-[#8814B1] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Категории
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === "menu"
                ? "bg-white text-[#8814B1] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Контент меню
          </button>
        </div>
      </div>

      {activeTab === "categories" ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
              Категории товаров
            </h2>
            <button
              onClick={handleOpenAddModal}
              className="px-6 py-3 bg-[#8814B1] text-white font-bold rounded-2xl hover:bg-[#8814B1]/90 transition-all flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
            >
              <FiPlus />
              Добавить категорию
            </button>
          </div>

          <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {settings?.categories.map((cat) => {
              const isActive = cat.status === "active";

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-all group"
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
                      <p className="font-bold text-gray-800 tracking-tight">
                        {cat.label}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                        ID: {cat.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Status Toggle */}
                    <div className="flex items-center gap-3 px-4 border-r border-gray-100">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-green-600" : "text-orange-600"}`}
                      >
                        {isActive ? "Активно" : "Скоро"}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(cat.id)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${isActive ? "bg-[#8814B1]" : "bg-gray-200"}`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-7" : "translate-x-1"}`}
                        />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Редактировать"
                      >
                        <FiEdit3 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setCategoryToDelete(cat);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Удалить"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Menu Sections Management */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                Контент меню
              </h2>
              {settings?.updatedAt && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                  <FiClock className="w-3 h-3" />
                  Изменено: {new Date(settings.updatedAt).toLocaleString()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Language Tabs for Menu */}
              <div className="flex border border-gray-100 bg-white rounded-xl overflow-hidden p-1">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setActiveLangTab(l.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all rounded-lg ${
                      activeLangTab === l.id
                        ? "bg-[#8814B1] text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.id.toUpperCase()}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleSaveMenu}
                disabled={!isMenuDirty || saving}
                className={`px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95 ${
                  isMenuDirty
                    ? "bg-[#8814B1] text-white shadow-purple-100 hover:bg-[#8814B1]/90"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                }`}
              >
                <FiSave />
                {saving ? "Сохранение..." : "Сохранить изменения"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Delivery Section - Row 1 */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm space-y-4 text-left">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <FiTruck size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Доставка {activeLangTab.toUpperCase()}
                </h3>
              </div>
              <textarea
                value={
                  activeLangTab === "ru"
                    ? menuDraft?.delivery || ""
                    : menuDraft?.translations?.[activeLangTab]?.delivery || ""
                }
                onChange={(e) =>
                  handleMenuDraftChange("delivery", e.target.value)
                }
                placeholder="Текст об условиях доставки..."
                rows={4}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#8814B1] outline-none transition-all text-sm text-gray-600 leading-relaxed"
              />
            </div>

            {/* Payment Section - Row 2 */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm space-y-4 text-left">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                <div className="w-10 h-10 bg-[#8814B1]/10 text-[#8814B1] rounded-xl flex items-center justify-center">
                  <FiCreditCard size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Оплата {activeLangTab.toUpperCase()}
                </h3>
              </div>
              <textarea
                value={
                  activeLangTab === "ru"
                    ? menuDraft?.payment || ""
                    : menuDraft?.translations?.[activeLangTab]?.payment || ""
                }
                onChange={(e) =>
                  handleMenuDraftChange("payment", e.target.value)
                }
                placeholder="Текст о способах оплаты..."
                rows={4}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#8814B1] outline-none transition-all text-sm text-gray-600 leading-relaxed"
              />
            </div>

            {/* About Us Section */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm space-y-4 text-left">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <FiBookOpen size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  О нас {activeLangTab.toUpperCase()}
                </h3>
              </div>
              <textarea
                value={
                  activeLangTab === "ru"
                    ? menuDraft?.about || ""
                    : menuDraft?.translations?.[activeLangTab]?.about || ""
                }
                onChange={(e) => handleMenuDraftChange("about", e.target.value)}
                placeholder="Расскажите о вашем магазине..."
                rows={8}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#8814B1] outline-none transition-all text-sm text-gray-600 leading-relaxed"
              />
            </div>

            {/* Contacts & Socials */}
            <div className="lg:col-span-2 bg-gray-900 p-10 rounded-[40px] shadow-xl space-y-8">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <FiMessageCircle className="text-purple-400 text-2xl" />
                <h3 className="text-2xl font-bold text-white">
                  Каналы связи и соцсети
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiMessageCircle className="text-[#229ED9]" />
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      Telegram Link
                    </label>
                  </div>
                  <input
                    type="text"
                    value={menuDraft?.telegram || ""}
                    onChange={(e) =>
                      handleMenuDraftChange("telegram", e.target.value)
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiMail className="text-purple-400" />
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      Email Address
                    </label>
                  </div>
                  <input
                    type="text"
                    value={menuDraft?.email || ""}
                    onChange={(e) =>
                      handleMenuDraftChange("email", e.target.value)
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiInstagram className="text-pink-500" />
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      Instagram (Artists)
                    </label>
                  </div>
                  <input
                    type="text"
                    value={menuDraft?.instagramArtists || ""}
                    onChange={(e) =>
                      handleMenuDraftChange("instagramArtists", e.target.value)
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiInstagram className="text-purple-500" />
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      Instagram (Store)
                    </label>
                  </div>
                  <input
                    type="text"
                    value={menuDraft?.instagramStore || ""}
                    onChange={(e) =>
                      handleMenuDraftChange("instagramStore", e.target.value)
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-[450px] space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            {editingCategory ? "Редактировать категорию" : "Добавить категорию"}
          </h2>

          <div className="space-y-4">
            <Input
              label="ID Категории (Slug)"
              value={catId}
              onChange={(e) =>
                setCatId(e.target.value.toLowerCase().replace(/\s+/g, "-"))
              }
              placeholder="например: summer-collection"
              disabled={!!editingCategory}
            />
            <p className="text-[11px] text-gray-400 -mt-2">
              ID используется для связи с товарами. Его нельзя изменить.
            </p>

            <div className="border border-gray-100 rounded-xl overflow-hidden text-left">
              <div className="flex border-b border-gray-100 bg-gray-50">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setActiveLangTab(l.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all border-b-2 ${
                      activeLangTab === l.id
                        ? "border-[#8814B1] text-[#8814B1] bg-white"
                        : "border-transparent text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
              <div className="p-4">
                <Input
                  label={`Название ${activeLangTab.toUpperCase()}`}
                  value={catLabel[activeLangTab]}
                  onChange={(e) =>
                    setCatLabel((prev) => ({
                      ...prev,
                      [activeLangTab]: e.target.value,
                    }))
                  }
                  placeholder={
                    activeLangTab === "ru"
                      ? "Напр: Женский"
                      : activeLangTab === "en"
                        ? "Example: Women"
                        : "Masalan: Ayollar"
                  }
                  required={activeLangTab === "ru"}
                  autoFocus={activeLangTab === "ru"}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 font-bold rounded-xl"
              onClick={() => setIsModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              className="flex-1 bg-[#8814B1] hover:bg-[#8814B1]/90 font-bold rounded-xl"
              onClick={handleSaveCategory}
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div className="w-[400px] text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <FiTrash2 size={32} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              Удалить категорию?
            </h2>
            <p className="text-gray-500 mt-2">
              Вы уверены, что хотите удалить{" "}
              <strong>"{categoryToDelete?.label}"</strong>?
              {categoryToDelete &&
                ["women", "men", "kids"].includes(categoryToDelete.id) && (
                  <span className="block mt-2 text-red-500 font-bold uppercase text-xs tracking-widest">
                    Это базовая категория системы!
                  </span>
                )}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 font-bold rounded-xl"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none font-bold rounded-xl shadow-lg shadow-red-100"
              onClick={handleConfirmDelete}
              disabled={saving}
            >
              {saving ? "Удаление..." : "Да, удалить"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
