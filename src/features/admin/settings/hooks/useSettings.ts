"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Lang } from "@/lib/i18n";
import { Category, SettingsData } from "../types";

export function useSettings() {
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
      newCategories = settings.categories.map((c) =>
        c.id === editingCategory.id
          ? { ...c, label: catLabel.ru, id: catId, translations }
          : c,
      );
    } else {
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

  return {
    settings,
    loading,
    saving,
    activeTab,
    setActiveTab,
    activeLangTab,
    setActiveLangTab,
    isModalOpen,
    setIsModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    editingCategory,
    categoryToDelete,
    setCategoryToDelete,
    catId,
    setCatId,
    catLabel,
    setCatLabel,
    menuDraft,
    isMenuDirty,
    handleToggleStatus,
    handleOpenAddModal,
    handleOpenEditModal,
    handleSaveCategory,
    handleConfirmDelete,
    handleMenuDraftChange,
    handleSaveMenu,
  };
}
