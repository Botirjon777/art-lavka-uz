import { useInfiniteQuery } from "@tanstack/react-query";

interface GalleryPage {
  data: any[];
  hasMore: boolean;
  nextPage: number;
}

const fetchGalleryPage = async ({
  pageParam = 1,
}: {
  pageParam?: number;
}): Promise<GalleryPage> => {
  const response = await fetch(`/api/gallery?page=${pageParam}&limit=12`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);

  return {
    data: data.data,
    hasMore: data.pagination?.hasMore ?? false,
    nextPage: pageParam + 1,
  };
};

export const useGalleryPaginated = (options: { enabled?: boolean } = {}) => {
  const { enabled = true } = options;

  return useInfiniteQuery({
    queryKey: ["gallery-paginated"],
    queryFn: ({ pageParam }) => fetchGalleryPage({ pageParam: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextPage : undefined),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2,
    enabled,
  });
};
