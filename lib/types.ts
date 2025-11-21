
import { OrderStatus } from '@prisma/client';

// Type definitions (not exported from @prisma/client)
export type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  images: string[];
  categoryId: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  featured: boolean;
  discountPercentage: number | null;
  discountAmount: number | null;
  discountStartDate: Date | null;
  discountEndDate: Date | null;
  isDiscounted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type { OrderStatus } from '@prisma/client';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
  product: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  totalAmount: number;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItem[];
  customer?: Customer;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  discountAmount: number;
  discountedPrice: number;
  product: Product;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryCity: string;
  notes?: string;
}

export type CategoryFilter = 'ALL' | Category;

export interface InventoryItemWithProduct extends InventoryItem {
  product: Product;
}

export interface InventoryUpdate {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export interface ProductWithInventory extends Product {
  inventoryItems: InventoryItem[];
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface DiscountData {
  discountPercentage?: number;
  discountAmount?: number;
  discountStartDate?: Date;
  discountEndDate?: Date;
  isDiscounted: boolean;
}

export interface ProductWithDiscount extends Product {
  discountedPrice?: number;
  discountAmount: number | null;
  isDiscountActive?: boolean;
}

export interface InventoryItem {
  id: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}
