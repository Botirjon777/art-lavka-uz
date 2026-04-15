"use client";

import Modal from "@/components/Modal";
import { Input, Button } from "@/components/ui";
import { LANGUAGES, Lang } from "@/lib/i18n";
import { Category } from "../../types";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: Category | null;
  catId: string;
  setCatId: (id: string) => void;
  catLabel: Record<string, string>;
  setCatLabel: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  activeLangTab: Lang;
  setActiveLangTab: (lang: Lang) => void;
  handleSaveCategory: () => void;
}

export default function CategoryModal({
  isOpen,
  onClose,
  editingCategory,
  catId,
  setCatId,
  catLabel,
  setCatLabel,
  activeLangTab,
  setActiveLangTab,
  handleSaveCategory,
}: CategoryModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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
                  onClick={() => setActiveLangTab(l.id as Lang)}
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
            onClick={onClose}
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
  );
}
