"use client";

import { FiPlus } from "react-icons/fi";
import { Category, SettingsData } from "../../types";
import CategoryList from "./CategoryList";
import CategoryModal from "./CategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";
import { Lang } from "@/lib/i18n";

interface CategoryTabProps {
  settings: SettingsData | null;
  handleToggleStatus: (id: string) => void;
  handleOpenAddModal: () => void;
  handleOpenEditModal: (category: Category) => void;
  handleSaveCategory: () => void;
  handleConfirmDelete: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (isOpen: boolean) => void;
  editingCategory: Category | null;
  categoryToDelete: Category | null;
  setCategoryToDelete: (category: Category) => void;
  catId: string;
  setCatId: (id: string) => void;
  catLabel: Record<string, string>;
  setCatLabel: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  activeLangTab: Lang;
  setActiveLangTab: (lang: Lang) => void;
  saving: boolean;
}

export default function CategoryTab({
  settings,
  handleToggleStatus,
  handleOpenAddModal,
  handleOpenEditModal,
  handleSaveCategory,
  handleConfirmDelete,
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
  activeLangTab,
  setActiveLangTab,
  saving,
}: CategoryTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
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

      <CategoryList
        categories={settings?.categories || []}
        handleToggleStatus={handleToggleStatus}
        handleOpenEditModal={handleOpenEditModal}
        setCategoryToDelete={setCategoryToDelete}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
      />

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingCategory={editingCategory}
        catId={catId}
        setCatId={setCatId}
        catLabel={catLabel}
        setCatLabel={setCatLabel}
        activeLangTab={activeLangTab}
        setActiveLangTab={setActiveLangTab}
        handleSaveCategory={handleSaveCategory}
      />

      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        categoryToDelete={categoryToDelete}
        handleConfirmDelete={handleConfirmDelete}
        saving={saving}
      />
    </div>
  );
}
