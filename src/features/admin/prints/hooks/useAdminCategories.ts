import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPrintCategories, createPrintCategory, updatePrintCategory, deletePrintCategory } from "../actions/categories";
import toast from "react-hot-toast";

export const useAdminPrintCategories = () => {
  return useQuery({
    queryKey: ["admin-print-categories"],
    queryFn: () => getPrintCategories(),
    staleTime: 10 * 60 * 1000, // Categories change less often
  });
};

export const useCreatePrintCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createPrintCategory(formData),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Категория добавлена");
        queryClient.invalidateQueries({ queryKey: ["admin-print-categories"] });
      } else {
        toast.error(result.error || "Ошибка при создании категории");
      }
    },
  });
};

export const useUpdatePrintCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => updatePrintCategory(id, formData),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Категория обновлена");
        queryClient.invalidateQueries({ queryKey: ["admin-print-categories"] });
        queryClient.invalidateQueries({ queryKey: ["admin-prints"] }); // Categories are displayed in prints
      } else {
        toast.error(result.error || "Ошибка при обновлении категории");
      }
    },
  });
};

export const useDeletePrintCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePrintCategory(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Категория удалена");
        queryClient.invalidateQueries({ queryKey: ["admin-print-categories"] });
      } else {
        toast.error(result.error || "Ошибка при удалении категории");
      }
    },
  });
};
