import { useQuery } from "@tanstack/react-query";
import { fetchGallery } from "../api/gallery";

export const useGallery = (options = {}) => {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: fetchGallery,
    ...options
  });
};
