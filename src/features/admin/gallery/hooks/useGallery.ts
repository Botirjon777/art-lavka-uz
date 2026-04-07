import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGalleries, deleteGallery } from "../actions/gallery";
import toast from "react-hot-toast";

export const useAdminGallery = () => {
  return useQuery({
    queryKey: ["admin-gallery"],
    queryFn: () => getGalleries(),
  });
};

export const useDeleteGallery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGallery(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Изображение успешно удалено");
        queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
        // Also invalidate client gallery if they might be stale
        queryClient.invalidateQueries({ queryKey: ["gallery"] });
      } else {
        toast.error(result.error || "Не удалось удалить изображение");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Произошла ошибка при удалении");
    },
  });
};
