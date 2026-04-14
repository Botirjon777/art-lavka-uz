"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPublicationById } from "@/features/admin/publications/actions/publications";
import PublicationForm from "@/features/admin/publications/components/PublicationForm";
import { Publication } from "@/types";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";

export default function EditPublicationPage() {
  const { id } = useParams();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublication = async () => {
      if (!id) return;
      const result = await getPublicationById(id as string);
      if (result.success) {
        setPublication(result.data);
      } else {
        toast.error(result.error || "Ошибка при загрузке");
      }
      setLoading(false);
    };

    fetchPublication();
  }, [id]);

  if (loading) return <Loader />;
  if (!publication) return <div className="p-8 text-center text-gray-500">Публикация не найдена</div>;

  return <PublicationForm initialData={publication} isEditing={true} />;
}
