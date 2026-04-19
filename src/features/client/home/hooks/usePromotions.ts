import { useQuery } from "@tanstack/react-query";
import { Promotion } from "@/types";

const fetchPromotions = async () => {
  const response = await fetch("/api/promotions");
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Promotion[];
};

export const usePromotions = () => {
  return useQuery({
    queryKey: ["promotions"],
    queryFn: fetchPromotions,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
