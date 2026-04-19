"use client";

import { useState, useEffect } from "react";
import { 
  FiMapPin, 
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiRefreshCw, 
  FiDownload, 
  FiCheck,
  FiX
} from "react-icons/fi";
import { getOffices, createOffice, updateOffice, deleteOffice, importFromDefaults, toggleOfficeStatus } from "../actions/offices";
import { Office } from "@/types";
import { LOCATIONS } from "@/lib/i18n/locations";
import toast from "react-hot-toast";
import Dropdown from "@/components/ui/Dropdown";
import Input from "@/components/ui/Input";

export default function OfficeManager() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState("Все регионы");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const regionKeys = ["Все регионы", ...Object.keys(LOCATIONS)];

  useEffect(() => {
    loadOffices();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [regionFilter, searchQuery]);

  const loadOffices = async () => {
    setLoading(true);
    const result = await getOffices();
    if (result.success) {
      setOffices(result.data);
    } else {
      toast.error(result.error || "Failed to load offices");
    }
    setLoading(false);
  };

  const handleImport = async () => {
    if (!confirm("Это импортирует офисы по умолчанию. Продолжить?")) return;
    setLoading(true);
    const result = await importFromDefaults();
    if (result.success) {
      toast.success(`Импортировано ${result.count} офисов`);
      loadOffices();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот офис?")) return;
    const result = await deleteOffice(id);
    if (result.success) {
      toast.success("Офис удален");
      loadOffices();
    } else {
      toast.error(result.error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await toggleOfficeStatus(id, !currentStatus);
    if (result.success) {
      setOffices(offices.map(off => off._id === id ? { ...off, isActive: !currentStatus } : off));
    }
  };

  const filteredOffices = offices.filter(office => {
    const matchesRegion = regionFilter === "Все регионы" || office.region === regionFilter;
    const matchesSearch = office.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          office.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          office.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOffices.length / itemsPerPage);
  const paginatedOffices = filteredOffices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию, адресу..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-purple-200 transition-all text-xs font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="w-full md:w-48 text-xs font-bold">
            <Dropdown
              label=""
              options={regionKeys.map(r => ({ value: r, label: r }))}
              value={regionFilter}
              onChange={(val) => setRegionFilter(val)}
            />
          </div>
          <button
            onClick={() => {
              setEditingOffice(null);
              setIsModalOpen(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#8814B1] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#8814B1]/90 transition-all shadow-md shadow-purple-100 active:scale-95"
          >
            <FiPlus size={16} />
            Добавить
          </button>
          
          {offices.length === 0 && !loading && (
            <button
              onClick={handleImport}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
            >
              <FiDownload size={16} />
              Импорт
            </button>
          )}

          <button
            onClick={loadOffices}
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 text-gray-400 rounded-xl hover:bg-gray-50 transition-all active:rotate-180 duration-500"
          >
            <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest w-16">Статус</th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Филиал / Регион</th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Адрес</th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Управление</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedOffices.length > 0 ? (
                paginatedOffices.map((office) => (
                  <tr key={office._id} className="group hover:bg-purple-50/10 transition-colors">
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => handleToggleStatus(office._id, office.isActive)}
                        className={`w-8 h-4.5 rounded-full transition-all relative ${office.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${office.isActive ? 'left-4' : 'left-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-[#8814B1] font-black text-sm">
                           {office.name.charAt(0)}
                         </div>
                         <div className="min-w-0">
                           <p className="text-sm font-black text-gray-800 truncate">{office.name}</p>
                           <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-[10px] font-bold text-[#8814B1] bg-purple-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                               {office.region}
                             </span>
                             <span className="text-[10px] font-bold text-gray-400">
                               {office.district}
                             </span>
                           </div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-semibold text-gray-500 max-w-sm leading-relaxed">{office.address}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingOffice(office);
                            setIsModalOpen(true);
                          }}
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#8814B1] hover:bg-white rounded-xl transition-all shadow-sm shadow-transparent hover:shadow-purple-100 border border-transparent hover:border-purple-100"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(office._id)}
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm shadow-transparent hover:shadow-red-100 border border-transparent hover:border-red-100"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-300">
                         <FiMapPin size={40} />
                       </div>
                       <div>
                         <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Офисы не найдены</p>
                         <p className="text-[10px] text-gray-400 mt-1">Попробуйте изменить параметры поиска или импортируйте офисы</p>
                       </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Страница</span>
              <span className="text-xs font-black text-[#8814B1] leading-none">{currentPage} из {totalPages}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-all active:scale-95"
              >
                Назад
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show current, first, last, and pages near current
                  if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                          currentPage === pageNum 
                            ? "bg-[#8814B1] text-white shadow-sm" 
                            : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="w-8 h-8 flex items-center justify-center text-gray-300">...</span>;
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#8814B1]/5 border border-purple-100 text-[#8814B1] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#8814B1]/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
              >
                Вперед
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Info */}
      <div className="flex justify-between items-center px-4">
         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
           Показано <span className="text-[#8814B1]">{paginatedOffices.length}</span> из <span className="text-[#8814B1]">{filteredOffices.length}</span> офисов
         </p>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <OfficeForm 
          office={editingOffice} 
          onClose={() => setIsModalOpen(false)} 
          onSaved={() => {
            setIsModalOpen(false);
            loadOffices();
          }}
        />
      )}
    </div>
  );
}

function OfficeForm({ office, onClose, onSaved }: { office: Office | null, onClose: () => void, onSaved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(office?.region || "город Ташкент");
  const regionKeys = Object.keys(LOCATIONS);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const result = office 
      ? await updateOffice(office._id, formData)
      : await createOffice(formData);

    if (result.success) {
      toast.success(office ? "Офис обновлен" : "Офис добавлен");
      onSaved();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                {office ? "Изменить офис" : "Новый офис"}
              </h3>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <FiX size={20} />
              </button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                   <Dropdown 
                     label="Регион"
                     options={regionKeys.map(r => ({ value: r, label: r }))}
                     value={selectedRegion}
                     onChange={(val) => setSelectedRegion(val)}
                     name="region"
                   />
                </div>
                <Input 
                  label="Район"
                  name="district"
                  defaultValue={office?.district}
                  placeholder="Напр: Яккасарайский р-н"
                  required
                />
                <Input 
                  label="Название филиала"
                  name="name"
                  defaultValue={office?.name}
                  placeholder="Напр: YAKKASAROY"
                  required
                />
              </div>

              <Input 
                label="Полный адрес"
                name="address"
                defaultValue={office?.address}
                placeholder="Полный адрес офиса..."
                required
              />

              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  defaultChecked={office?.isActive ?? true}
                  className="w-5 h-5 rounded border-gray-300 text-[#8814B1] focus:ring-[#8814B1]" 
                />
                <span className="text-sm font-bold text-gray-600">Активен (отображать на сайте)</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 bg-[#8814B1] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#8814B1]/90 shadow-lg shadow-purple-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
