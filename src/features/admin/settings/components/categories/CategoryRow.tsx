"use client";

import { FiCheckCircle, FiClock, FiEdit3, FiTrash2 } from "react-icons/fi";
import { Category } from "../../types";

interface CategoryRowProps {
  category: Category;
  handleToggleStatus: (id: string) => void;
  handleOpenEditModal: (category: Category) => void;
  setCategoryToDelete: (category: Category) => void;
  setIsDeleteModalOpen: (isOpen: boolean) => void;
}

export default function CategoryRow({
  category,
  handleToggleStatus,
  handleOpenEditModal,
  setCategoryToDelete,
  setIsDeleteModalOpen,
}: CategoryRowProps) {
  const isActive = category.status === "active";

  return (
    <div className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-all group">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isActive ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
          }`}
        >
          {isActive ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
        </div>
        <div>
          <p className="font-bold text-gray-800 tracking-tight">
            {category.label}
          </p>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
            ID: {category.id}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Status Toggle */}
        <div className="flex items-center gap-3 px-4 border-r border-gray-100">
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${
              isActive ? "text-green-600" : "text-orange-600"
            }`}
          >
            {isActive ? "Активно" : "Скоро"}
          </span>
          <button
            onClick={() => handleToggleStatus(category.id)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
              isActive ? "bg-[#8814B1]" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isActive ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(category)}
            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Редактировать"
          >
            <FiEdit3 size={18} />
          </button>
          <button
            onClick={() => {
              setCategoryToDelete(category);
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
}
