export interface ProductInventory {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id?: string;
  _id?: string;
  name: string;
  image: string;
  category: string;
  price: number;
  model: string;
  colors?: ProductColor[];
  sizes?: string[];
  stock: number; // Total stock
  inventory: ProductInventory; // Stock per size
  description?: string;
  isNew?: boolean;
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

// Order types
export interface Order {
  _id?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  region: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  product: {
    _id: string;
    name: string;
    image: string;
    model: string;
    category?: string;
  };
  print: {
    _id: string;
    name: string;
    frontImage: string;
    backImage?: string;
  } | null;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";
export type PaymentMethod = "cash" | "payme" | "click";
