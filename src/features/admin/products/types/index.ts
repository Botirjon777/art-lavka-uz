export interface SizeTableEntry {
  size: string;
  width: string;
  height: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  active: boolean;
  sizeTable?: SizeTableEntry[];
  createdAt?: string;
  updatedAt?: string;
}
