import { useQuery } from "@tanstack/react-query";
import { PrintDesign } from "@/types";

const fetchPrint = async (id: string): Promise<PrintDesign> => {
  const response = await fetch(`/api/prints/${id}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || "Failed to fetch print");
  return { ...data.data, id: data.data._id } as PrintDesign;
};

export const usePrint = (id: string) =>
  useQuery({
    queryKey: ["print", id],
    queryFn: () => fetchPrint(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
  });
