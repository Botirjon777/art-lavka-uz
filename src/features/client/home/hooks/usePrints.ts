import { useQuery } from "@tanstack/react-query";
import { PrintDesign } from "@/types";

const fetchPrints = async () => {
  const response = await fetch("/api/prints?limit=100");
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data.map((item: any) => ({ ...item, id: item._id })) as PrintDesign[];
};

export const usePrints = (options = {}) => {
  return useQuery({
    queryKey: ["prints"],
    queryFn: fetchPrints,
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options
  });
};
