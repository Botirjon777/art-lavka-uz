import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, getOrderById, updateOrderStatus } from "../actions/orders";
import toast from "react-hot-toast";
import { OrderStatus, PaymentStatus } from "@/types";

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => getOrders(),
    staleTime: 60 * 1000,
  });
};

export const useOrderById = (id: string) => {
  return useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      paymentStatus,
    }: {
      id: string;
      status: OrderStatus;
      paymentStatus?: PaymentStatus;
    }) => updateOrderStatus(id, status, paymentStatus),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Статус обновлен");
        if (result.order._id) {
          queryClient.invalidateQueries({
            queryKey: ["admin-order", result.order._id],
          });
        }
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      } else {
        toast.error(result.error || "Не удалось обновить статус");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Ошибка при обновлении статуса");
    },
  });
};
