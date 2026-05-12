import { useQuery } from "@tanstack/react-query";
import { Office } from "@/types";

const fetchOffices = async () => {
  const response = await fetch("/api/offices");
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Office[];
};

export const useOffices = (options = {}) => {
  return useQuery({
    queryKey: ["offices"],
    queryFn: fetchOffices,
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options
  });
};
