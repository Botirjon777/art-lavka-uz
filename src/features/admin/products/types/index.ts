export interface SizeTableEntry {
  size: string;
  width: string;
  height: string;
  image?: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  promoPrice?: number;
  category: string;
  image: string;
  stock: number;
  active: boolean;
  lastPromoSentAt?: string;
  weight?: number;
  sizeTable?: SizeTableEntry[];
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
