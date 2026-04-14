"use client";

import { useState, useEffect } from "react";
import { FiSave, FiSettings, FiCheckCircle, FiClock, FiPlus, FiTrash2, FiEdit3 } from "react-icons/fi";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import { Input, Button } from "@/components/ui";

interface Category {
  id: string;
  label: string;
  status: "active" | "soon";
}

interface SettingsData {
  categories: Category[];
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Category Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [catId, setCatId] = useState("");
  const [catLabel, setCatLabel] = useState("");

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

  const handleToggleStatus = async (id: string) => {
    if (!settings) return;

    const newCategories = settings.categories.map((c) => 
      c.id === id ? { ...c, status: c.status === "active" ? "soon" : "active" } : c
    );
    const updatedSettings = { ...settings, categories: newCategories };

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
    setCatLabel("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    setCatId(category.id);
    setCatLabel(category.label);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!settings) return;
    if (!catId.trim() || !catLabel.trim()) {
      toast.error("Заполните все поля");
      return;
    }

    // Check for duplicate ID if adding new
    if (!editingCategory && settings.categories.some(c => c.id === catId)) {
      toast.error("Категория с таким ID уже существует");
      return;
    }

    let newCategories;
    if (editingCategory) {
      // Edit
      newCategories = settings.categories.map(c => 
        c.id === editingCategory.id ? { ...c, label: catLabel, id: catId } : c
      );
    } else {
      // Add
      newCategories = [...settings.categories, { id: catId, label: catLabel, status: "soon" as const }];
    }

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
        toast.success(editingCategory ? "Категория обновлена" : "Категория добавлена");
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

    const newCategories = settings.categories.filter(c => c.id !== categoryToDelete.id);
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
            Управление динамическими категориями и видимостью магазина
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-semibold rounded-xl transition-all shadow-lg"
          >
            <FiPlus className="w-5 h-5" />
            Добавить категорию
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">
            Управление категориями
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Настройте отображение категорий в конфигураторе. Категории "Скоро" будут видны, но недоступны для заказа.
          </p>
        </div>

        <div className="p-8 space-y-4">
          {settings?.categories.map((cat) => {
            const isActive = cat.status === "active";

            return (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/10 transition-all group"
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
                    <p className="font-bold text-gray-800">{cat.label}</p>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-mono">
                      ID: {cat.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Status Toggle */}
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${isActive ? "text-green-600" : "text-orange-600"}`}>
                      {isActive ? "Активно" : "Скоро"}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(cat.id)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${isActive ? "bg-[#8814B1]" : "bg-gray-200"}`}
                    >
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-7" : "translate-x-1"}`} />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-l border-gray-100 pl-6 h-10">
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <FiEdit3 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setCategoryToDelete(cat);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-[450px] space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingCategory ? "Редактировать категорию" : "Добавить категорию"}
          </h2>
          
          <div className="space-y-4">
            <Input
              label="ID Категории (Slug)"
              value={catId}
              onChange={(e) => setCatId(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="например: summer-collection"
              disabled={!!editingCategory} // Forbid ID changes for existing categories to prevent breaking associations
            />
            <p className="text-[11px] text-gray-400 -mt-2">
              ID используется в базе данных для связи с товарами. Его нельзя изменить после создания.
            </p>
            
            <Input
              label="Название (Label)"
              value={catLabel}
              onChange={(e) => setCatLabel(e.target.value)}
              placeholder="например: Женский"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              className="flex-1 bg-[#8814B1] hover:bg-[#8814B1]/90"
              onClick={handleSaveCategory}
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="w-[400px] text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <FiTrash2 size={32} />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Удалить категорию?</h2>
            <p className="text-gray-500 mt-2">
              Вы уверены, что хотите удалить категорию <strong>"{categoryToDelete?.label}"</strong>? 
              {categoryToDelete && ["women", "men", "kids"].includes(categoryToDelete.id) && (
                <span className="block mt-2 text-red-500 font-medium">
                  Внимание: Это базовая категория системы!
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none"
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
