"use client";

import { useState } from "react";
import {
  useAdminPrintCategories,
  useCreatePrintCategory,
  useUpdatePrintCategory,
  useDeletePrintCategory,
} from "../hooks/useAdminCategories";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiTag,
  FiAlertTriangle,
} from "react-icons/fi";
import { Button, Input } from "@/components/ui";
import Modal from "@/components/Modal";
import { PrintCategory } from "@/types";
import Loader from "@/components/Loader";

export default function CategoryList() {
  const { data: categories = [], isLoading: loading } =
    useAdminPrintCategories();
  const createMutation = useCreatePrintCategory();
  const updateMutation = useUpdatePrintCategory();
  const deleteMutation = useDeletePrintCategory();

  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);

    createMutation.mutate(formData, {
      onSuccess: () => {
        setName("");
        setSlug("");
        setIsCreateOpen(false);
      },
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedCategory) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);

    updateMutation.mutate(
      { id: selectedCategory._id, formData },
      {
        onSuccess: () => {
          setName("");
          setSlug("");
          setSelectedCategory(null);
          setIsEditOpen(false);
        },
      },
    );
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    deleteMutation.mutate(selectedCategory._id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedCategory(null);
      },
    });
  };

  const openEdit = (cat: any) => {
    setSelectedCategory(cat);
    setName(cat.name);
    setSlug(cat.slug || "");
    setIsEditOpen(true);
  };

  const openDelete = (cat: any) => {
    setSelectedCategory(cat);
    setIsDeleteOpen(true);
  };

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-[35px] font-bold text-gray-900 tracking-tight">
            Категории принтов
          </h1>
          <p className="text-gray-500 mt-2 mb-5 text-lg">
            Рубрикатор дизайнерских изделий
          </p>
        </div>
        <Button
          onClick={() => {
            setName("");
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2"
          variant="secondary"
          size="lg"
        >
          <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Добавить категорию
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-lg p-10 text-center border border-gray-100">
          <h3 className="text-3xl font-black text-gray-900 mb-3">
            Категорий пока нет
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto text-lg leading-relaxed">
            Создайте первую категорию, чтобы начать классифицировать ваши
            принты.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-5 py-5 text-[12px] uppercase tracking-[0.2em] text-gray-400">
                    Название
                  </th>
                  <th className="px-5 text-[12px] uppercase tracking-[0.2em] text-gray-400">
                    Slug
                  </th>
                  <th className="px-5 text-[12px] uppercase tracking-[0.2em] text-gray-400">
                    Количество принтов
                  </th>
                  <th className="px-5 text-[12px] uppercase tracking-[0.2em] text-gray-400 text-right">
                    Действие
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map((cat: PrintCategory) => (
                  <tr
                    key={cat._id}
                    className="hover:bg-gray-50/50 transition-all group"
                  >
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-6">
                        <span className="font-bold text-gray-900 text-md tracking-tight">
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <code className="px-4 py-2 bg-gray-100/80 text-gray-500 rounded-xl text-[13px] font-mono font-black border border-gray-100">
                        {cat.slug}
                      </code>
                    </td>
                    <td className="px-5 py-5 font-bold text-gray-900 text-xl tracking-tight">
                      {cat.printCount || 0}
                    </td>
                    <td className="px-5 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        <Button
                          size="sm"
                          variant="white"
                          onClick={() => openEdit(cat)}
                          className="p-3.5"
                          title="Редактировать"
                          icon={<FiEdit2 />}
                        >
                          Редактировать
                        </Button>
                        <Button
                          size="sm"
                          variant="white"
                          disabled={cat.printCount > 0}
                          onClick={() => openDelete(cat)}
                          className={`p-3.5 ${cat.printCount > 0 ? "" : "text-red-500 hover:text-red-600"}`}
                          title={
                            cat.printCount > 0
                              ? "Сначала удалите принты"
                              : "Удалить"
                          }
                          icon={<FiTrash2 />}
                        >
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-14 h-14 bg-purple-50 text-[#8814B1] rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              <FiPlus />
            </span>
            <div>
              <h3 className="text-2xl font-black text-gray-900 leading-tight">
                Новая категория
              </h3>
              <p className="text-gray-400 font-medium">
                Будет добавлена в рубрикатор
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-8">
            <Input
              label="Название (Rus/Uzb)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Напр: Прикольные"
              required
              autoFocus
            />
            <Input
              label="Slug (URL)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Напр: prikolnye (опционально)"
              helperText="Оставьте пустым для автогенерации"
            />

            <div className="flex gap-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setIsCreateOpen(false)}
                type="button"
              >
                Отмена
              </Button>
              <Button
                variant="secondary"
                fullWidth
                type="submit"
                isLoading={isSaving}
              >
                Добавить
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-14 h-14 bg-[#00C6F1]/10 text-[#00C6F1] rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              <FiEdit2 />
            </span>
            <div>
              <h3 className="text-2xl font-black text-gray-900 leading-tight">
                Обновить категорию
              </h3>
              <p className="text-gray-400 font-medium">
                Изменения отразятся на всех изделиях
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-8">
            <Input
              label="Новое название"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
            <Input
              label="Slug (URL)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Напр: extra-slug"
              helperText="URL адрес категории (на английском)"
            />

            <div className="flex gap-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedCategory(null);
                }}
                type="button"
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                fullWidth
                type="submit"
                isLoading={isSaving}
              >
                Сохранить
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <div className="max-w-md mx-auto text-center py-4">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">
            <FiAlertTriangle />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">
            Вы уверены?
          </h3>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed">
            Категория{" "}
            <span className="text-red-500 font-black">
              "{selectedCategory?.name}"
            </span>{" "}
            будет удалена безвозвратно.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700 border-none"
              fullWidth
              onClick={handleDelete}
              isLoading={isSaving}
            >
              Да, удалить
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsDeleteOpen(false)}
            >
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
