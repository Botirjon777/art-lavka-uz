import { useQuery } from "@tanstack/react-query";

const fetchSettings = async () => {
  const response = await fetch("/api/settings");
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export const useSettings = (options = {}) => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    ...options
  });
};
