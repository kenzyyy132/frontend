
export const PRODUCT_CATEGORIES = ['skincare', 'makeup', 'perfume', 'sets'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  skincare: 'Skincare',
  makeup: 'Makeup',
  perfume: 'Perfume',
  sets: 'Gift Sets',
};

export interface ProductAuthor {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  brand: string;
  stock: number;
  image: string;
  inStock: boolean;
  createdBy: string | ProductAuthor | null;
  createdAt: string;
  updatedAt: string;
}

export const PRODUCT_SORTS = ['newest', 'oldest', 'price-asc', 'price-desc', 'name'] as const;

export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const SORT_LABELS: Record<ProductSort, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  name: 'Name A-Z',
};

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: ProductCategory | '';
  brand?: string;
  search?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  inStock?: boolean | null;
  sort?: ProductSort;
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  brand: string;
  stock: number;
}

export const LOW_STOCK_THRESHOLD = 10;

export type StockLevel = 'in-stock' | 'low-stock' | 'out-of-stock';

export function stockLevelOf(product: Pick<Product, 'stock'>): StockLevel {
  if (product.stock <= 0) return 'out-of-stock';
  return product.stock <= LOW_STOCK_THRESHOLD ? 'low-stock' : 'in-stock';
}
