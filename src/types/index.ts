export interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
}

export interface PrintDesign {
  id: string;
  name: string;
  image: string;
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
