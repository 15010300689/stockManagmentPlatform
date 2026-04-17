export interface ProductItem {
  /** 后端为 BIGINT 自增，JSON 常为 number */
  id: string | number;
  name: string;
  category: string;
  totalValue?: number;
  quantity: number;
  price: number;
  lowStockThreshold?: number;
  /** 后端商品安全库存（可选） */
  safeStock?: number;
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
