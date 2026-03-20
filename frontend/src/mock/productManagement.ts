import type { ProductItem, Stats } from '../types/inventory';

export const mockProducts: ProductItem[] = [
    { id: 'P001', name: '电脑', category: '电子产品', totalValue: 100, quantity: 100, price: 100, lowStockThreshold: 10 },
    { id: 'P002', name: '手机', category: '电子产品', totalValue: 100, quantity: 100, price: 100, lowStockThreshold: 10 },
    { id: 'P003', name: '平板', category: '电子产品', totalValue: 100, quantity: 100, price: 100, lowStockThreshold: 10 },
];

export const mockStatics: Stats = {
    productCount: 3,
    totalValue: 300,
    categories: ['电子产品', '家具', '服装'],
};

export const mockLowStockProducts: ProductItem[] = [
    { id: 'P001', name: '电脑', category: '电子产品', totalValue: 100, quantity: 10, price: 100, lowStockThreshold: 10 },
    { id: 'P002', name: '手机', category: '电子产品', totalValue: 100, quantity: 10, price: 100, lowStockThreshold: 10 },
    { id: 'P003', name: '平板', category: '电子产品', totalValue: 100, quantity: 10, price: 100, lowStockThreshold: 10 },
];

export const mockGetProductsById = (id: string): ProductItem | undefined => {
    return mockProducts.find((product) => product.id === id);
};
