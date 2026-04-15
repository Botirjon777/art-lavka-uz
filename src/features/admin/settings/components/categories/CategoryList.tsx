"use client";

import { Category } from "../../types";
import CategoryRow from "./CategoryRow";

interface CategoryListProps {
  categories: Category[];
  handleToggleStatus: (id: string) => void;
  handleOpenEditModal: (category: Category) => void;
  setCategoryToDelete: (category: Category) => void;
  setIsDeleteModalOpen: (isOpen: boolean) => void;
}

export default function CategoryList({
  categories,
  handleToggleStatus,
  handleOpenEditModal,
  setCategoryToDelete,
  setIsDeleteModalOpen,
}: CategoryListProps) {
  return (
    <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
      {categories.map((cat) => (
        <CategoryRow
          key={cat.id}
          category={cat}
          handleToggleStatus={handleToggleStatus}
          handleOpenEditModal={handleOpenEditModal}
          setCategoryToDelete={setCategoryToDelete}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
        />
      ))}
    </div>
  );
}
