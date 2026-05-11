export interface SizeTableEntry {
  size: string;
  width: string;
  height: string;
}

export interface ProductInventory {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

export interface ProductVariant {
  size: string;
  price: number;
  oldPrice?: number;
  promoPrice?: number;
  stock: number;
  hideExactStock?: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
  variants: ProductVariant[];
  translations?: Record<string, { name: string }>;
}

export interface Translation {
  name: string;
  description?: string;
}

export interface Product {
  id?: string;
  _id?: string;
  name: string;
  image: string;
  category: string;
  price: number;
  oldPrice?: number;
  promoPrice?: number;
  model: string;
  colors?: ProductColor[];
  sizes?: string[];
  stock: number; // Total stock
  inventory: ProductInventory; // Stock per size
  description?: string;
  isNew?: boolean;
  isDefault?: boolean;
  sizeTable?: SizeTableEntry[];
  weight?: number;
  lastPromoSentAt?: string;
  translations?: Record<string, Translation>;
  updatedAt?: string;
}


export interface PrintCategory {
  _id: string;
  name: string;
  slug: string;
  printCount: number;
  translations?: Record<string, { name: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface Print {
  _id: string;
  name: string;
  frontImage: string;
  frontImagePreview?: string;
  backImage?: string;
  category: string;
  active: boolean;
  translations?: Record<string, Translation>;
  createdAt: string;
  updatedAt: string;
}

export interface PrintDesign {
  id?: string;
  _id?: string;
  name: string;
  frontImage: string;
  frontImagePreview?: string;
  backImage?: string;
  category: string;
  translations?: Record<string, Translation>;
}

export interface CartItem {
  id: string;
  product: Product;
  print: PrintDesign | null;
  color: string;
  size: string;
  quantity: number;
  price: number;
  oldPrice?: number;
}

export interface ConfiguratorState {
  selectedPrint: PrintDesign | null;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
  price?: number;
  oldPrice?: number;
}

export type ModalType = "menu" | "cart" | "gallery" | null;

// Order types
export interface Order {
  _id?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  region: string;
  village: string;
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
    model?: string;
    category?: string;
  };
  print: {
    _id: string;
    name: string;
    frontImage: string;
    frontImagePreview?: string;
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

export interface Publication {
  _id: string;
  title: string;
  content?: string;
  image?: string;
  targetUrl: string;
  views: number;
  clicks: number;
  isActive: boolean;
  type: "news" | "promo" | "social";
  lastBroadcastAt?: string;
  createdAt: string;
  updatedAt: string;
}
export interface ICategory {
  id: string;
  label: string;
  status: "active" | "soon";
  translations?: Record<string, { label: string }>;
}

export interface Promotion {
  _id: string;
  name: string;
  type: "global" | "targeted";
  conditionType: "min_items" | "min_amount" | "product_selected";
  conditionValue: any;
  discountType: "percentage" | "fixed" | "free_delivery";
  discountValue: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  description?: string;
  translations?: Record<string, { name: string; description?: string }>;
  selectedRegions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ISettings {
  categories: ICategory[];
  menu: {
    delivery: string;
    payment: string;
    about: string;
    telegram: string;
    email: string;
    instagramArtists: string;
    instagramStore: string;
    translations?: Record<string, { delivery?: string; payment?: string; about?: string }>;
  };
  categoryStatuses?: {
    [key: string]: "active" | "soon";
  };
}

export interface Office {
  _id: string;
  region: string;
  district: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
