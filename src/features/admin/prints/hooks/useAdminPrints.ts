import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPrints, getPrintById, createPrint, updatePrint, deletePrint } from "../actions/prints";
import toast from "react-hot-toast";

export const useAdminPrints = () => {
  return useQuery({
    queryKey: ["admin-prints"],
    queryFn: () => getPrints(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminPrintById = (id: string) => {
  return useQuery({
    queryKey: ["admin-prints", id],
    queryFn: () => getPrintById(id),
    enabled: !!id,
  });
};

export const useCreatePrint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createPrint(formData),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Принт успешно создан");
        queryClient.invalidateQueries({ queryKey: ["admin-prints"] });
      } else {
        toast.error(result.error || "Ошибка при создании принта");
      }
    },
  });
};

export const useUpdatePrint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => updatePrint(id, formData),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Принт обновлен");
        queryClient.invalidateQueries({ queryKey: ["admin-prints"] });
      } else {
        toast.error(result.error || "Ошибка при обновлении принта");
      }
    },
  });
};

export const useDeletePrint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePrint(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Принт успешно удален");
        queryClient.invalidateQueries({ queryKey: ["admin-prints"] });
      } else {
        toast.error(result.error || "Не удалось удалить принт");
      }
    },
  });
};
