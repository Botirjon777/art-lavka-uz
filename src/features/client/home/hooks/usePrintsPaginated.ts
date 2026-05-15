import { useInfiniteQuery } from "@tanstack/react-query";
import { PrintDesign } from "@/types";

interface PrintsPage {
  prints: PrintDesign[];
  hasMore: boolean;
  nextPage: number;
}

const fetchPrintsPage = async ({
  pageParam = 1,
  category,
}: {
  pageParam?: number;
  category?: string;
}): Promise<PrintsPage> => {
  const params = new URLSearchParams({
    page: String(pageParam),
    limit: "20",
  });
  if (category && category !== "all") params.set("category", category);

  const response = await fetch(`/api/prints?${params.toString()}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);

  return {
    prints: data.data.map((item: any) => ({ ...item, id: item._id })) as PrintDesign[],
    hasMore: data.pagination?.hasMore ?? false,
    nextPage: pageParam + 1,
  };
};

export const usePrintsPaginated = (options: { enabled?: boolean; category?: string } = {}) => {
  const { enabled = true, category = "all" } = options;

  return useInfiniteQuery({
    queryKey: ["prints-paginated", category],
    queryFn: ({ pageParam }) => fetchPrintsPage({ pageParam: pageParam as number, category }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextPage : undefined),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2,
    enabled,
  });
};
