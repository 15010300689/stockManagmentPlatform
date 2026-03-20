export interface ProductItem {
  id: string;
  name: string;
  category: string;
  totalValue?: number;
  quantity: number;
  price: number;
  lowStockThreshold?: number;
}

export interface StoreItem {
  id: number;
  code: string;
  name: string;
  address?: string;
  contact?: string;
  phone?: string;
  status: string;
  createTime?: string;
}

export interface PositionItem {
  id: number;
  warehouseId: number;
  parentId: number | null;
  code: string;
  name?: string;
  type: string;
  status: string;
  maxCapacity: number;
  unit?: string;
  createTime?: string;
}

export interface Stats {
  productCount: number;
  totalValue: number;
  categories: string[];
}
