export interface GalleryImage {
  _id: string;
  id: string;
  name: string;
  image: string;
  productId?: string;
}

export const fetchGallery = async (): Promise<GalleryImage[]> => {
  const response = await fetch("/api/gallery");
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch gallery");
  }

  return data.data.map((item: any) => ({ ...item, id: item._id }));
};
