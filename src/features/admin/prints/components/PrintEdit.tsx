"use client";

import { useState, useEffect, use } from "react";
import { getPrintById } from "../actions/prints";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PrintForm from "./PrintForm";
import { FiAlertTriangle } from "react-icons/fi";
import Loader from "@/components/Loader";

export default function PrintEdit() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [print, setPrint] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPrint();
    }
  }, [id]);

  const loadPrint = async () => {
    setLoading(true);
    try {
      const data = await getPrintById(id);
      if (data) {
        setPrint(data);
      } else {
        toast.error("Принт не найден в базе данных");
        router.push("/admin/prints");
      }
    } catch (error) {
      toast.error("Ошибка при обмене данными");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!print) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
        <FiAlertTriangle className="w-16 h-16 text-orange-400 mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Объект не найден</h3>
        <p className="text-gray-500 mb-8">Запрашиваемый принт отсутствует или был удален</p>
        <button 
           onClick={() => router.push('/admin/prints')}
           className="px-8 py-3 bg-[#8814B1] text-white rounded-2xl font-bold hover:shadow-lg transition-all"
        >
          В коллекцию
        </button>
      </div>
    );
  }

  return <PrintForm initialData={print} isEditing={true} />;
}
