import { Product } from "@/types";

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch("/api/products");
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch products");
  }

  return data.data.map((item: any) => ({ ...item, id: item._id }));
};
