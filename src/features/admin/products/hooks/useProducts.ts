import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, deleteProduct } from "../actions/products";
import toast from "react-hot-toast";

export const useAdminProducts = () => {
  return useQuery({
    queryKey: ["admin-products"],
    queryFn: () => getProducts(),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Продукт успешно удален");
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        // Also invalidate client products if they might be stale
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        toast.error(result.error || "Не удалось удалить продукт");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Произошла ошибка при удалении");
    },
  });
};
