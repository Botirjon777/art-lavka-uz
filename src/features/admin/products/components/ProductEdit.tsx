"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "../actions/products";
import ProductForm from "./ProductForm";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";

export default function ProductEdit() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await getProductById(id as string);
      if (data) {
        setProduct(data);
      } else {
        toast.error("Товар не найден");
        router.push("/admin/products");
      }
    } catch (error) {
      toast.error("Ошибка при загрузке");
      router.push("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!product) return null;

  return <ProductForm initialData={product} isEditing={true} />;
}
