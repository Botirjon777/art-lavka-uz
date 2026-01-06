export interface Product {
  id?: string;
  _id?: string;
  name: string;
  image: string;
  category: string;
  price: number;
  model: string;
  colors?: string[];
  sizes?: string[];
  stock: number;
}

export interface PrintDesign {
  id?: string;
  _id?: string;
  name: string;
  frontImage: string;
  backImage?: string;
  category: "national" | "stylish" | "funny" | "all";
}

export interface CartItem {
  id: string;
  product: Product;
  print: PrintDesign | null;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

export interface ConfiguratorState {
  selectedPrint: PrintDesign | null;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export type ModalType = "menu" | "cart" | "gallery" | null;
