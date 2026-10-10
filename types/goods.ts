import type { Category } from './category';

export interface GoodsOption {
  name: string;
  values: string[];
}

export interface QuantityDiscount {
  minQuantity: number;
  unitPrice: number;
}

export interface Goods {
  _id: string;
  name: string;
  slug: string;

  category: Category | null;

  description?: string;
  price: number;
  salePrice?: number | null;

  quantityDiscounts?: QuantityDiscount[] | null;

  image?: string;

  options?: GoodsOption[];

  stock: number;
  label?: string[];
  soldOut: boolean;
  isAvailable: boolean;
}
