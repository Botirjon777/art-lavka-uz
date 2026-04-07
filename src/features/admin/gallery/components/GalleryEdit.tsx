"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGalleryById } from "../actions/gallery";
import GalleryForm from "./GalleryForm";
import toast from "react-hot-toast";
import { GalleryImage } from "../types";
import Loader from "@/components/Loader";

export default function GalleryEdit() {
  const { id } = useParams();
  const router = useRouter();
  const [gallery, setGallery] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadGallery();
    }
  }, [id]);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const data = await getGalleryById(id as string);
      if (data) {
        setGallery(data);
      } else {
        toast.error("Изображение не найдено");
        router.push("/admin/gallery");
      }
    } catch (error) {
      toast.error("Ошибка при загрузке");
      router.push("/admin/gallery");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!gallery) return null;

  return <GalleryForm initialData={gallery} isEditing={true} />;
}
