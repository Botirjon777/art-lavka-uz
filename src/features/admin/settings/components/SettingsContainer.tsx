"use client";

import { useSettings } from "../hooks/useSettings";
import SettingsHeader from "./SettingsHeader";
import CategoryTab from "./categories/CategoryTab";
import MenuTab from "./menu/MenuTab";

export default function SettingsContainer() {
  const {
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
  } = useSettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8814B1]"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-5 space-y-5">
      <SettingsHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "categories" ? (
        <CategoryTab
          settings={settings}
          handleToggleStatus={handleToggleStatus}
          handleOpenAddModal={handleOpenAddModal}
          handleOpenEditModal={handleOpenEditModal}
          handleSaveCategory={handleSaveCategory}
          handleConfirmDelete={handleConfirmDelete}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          isDeleteModalOpen={isDeleteModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          editingCategory={editingCategory}
          categoryToDelete={categoryToDelete}
          setCategoryToDelete={setCategoryToDelete}
          catId={catId}
          setCatId={setCatId}
          catLabel={catLabel}
          setCatLabel={setCatLabel}
          activeLangTab={activeLangTab}
          setActiveLangTab={setActiveLangTab}
          saving={saving}
        />
      ) : (
        <MenuTab
          settings={settings}
          menuDraft={menuDraft}
          activeLangTab={activeLangTab}
          setActiveLangTab={setActiveLangTab}
          isMenuDirty={isMenuDirty}
          saving={saving}
          handleMenuDraftChange={handleMenuDraftChange}
          handleSaveMenu={handleSaveMenu}
        />
      )}
    </div>
  );
}
