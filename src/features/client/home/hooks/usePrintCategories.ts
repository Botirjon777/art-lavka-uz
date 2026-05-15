import { useQuery } from "@tanstack/react-query";
import { PrintCategory } from "@/types";

const fetchPrintCategories = async () => {
  const response = await fetch("/api/print-categories");
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as PrintCategory[];
};

export const usePrintCategories = (options = {}) => {
  return useQuery({
    queryKey: ["printCategories"],
    queryFn: fetchPrintCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options
  });
};
