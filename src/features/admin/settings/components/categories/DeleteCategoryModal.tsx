"use client";

import Modal from "@/components/Modal";
import { Button } from "@/components/ui";
import { FiTrash2 } from "react-icons/fi";
import { Category } from "../../types";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToDelete: Category | null;
  handleConfirmDelete: () => void;
  saving: boolean;
}

export default function DeleteCategoryModal({
  isOpen,
  onClose,
  categoryToDelete,
  handleConfirmDelete,
  saving,
}: DeleteCategoryModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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
            onClick={onClose}
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
  );
}
