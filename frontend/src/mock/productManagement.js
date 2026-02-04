export const mockProducts = [
    {
        id: 1,
        name: '电脑',
        category: '电子产品',
        totalValue: 100,
        quantity: 100,
        price: 100,
        lowStockThreshold: 10,
    },
    {
        id: 2,
        name: '手机',
        category: '电子产品',
        totalValue: 100,
        quantity: 100,
        price: 100,
        lowStockThreshold: 10,
    },
    {
        id: 3,
        name: '平板',
        category: '电子产品',
        totalValue: 100,
        quantity: 100,
        price: 100,
        lowStockThreshold: 10,
    }
]

export const mockStatics = {
    productCount: 3,
    totalValue: 300,
    categories: ['电子产品', '家具', '服装']
};

export const mockLowStockProducts = [
    {
        id: 1,
        name: '电脑',
        category: '电子产品',
        totalValue: 100,
        quantity: 10,
        price: 100,
        lowStockThreshold: 10,
    },
    {
        id: 2,
        name: '手机',
        category: '电子产品',
        totalValue: 100,
        quantity: 10,
        price: 100,
        lowStockThreshold: 10,
    },
    {
        id: 3,
        name: '平板',
        category: '电子产品',
        totalValue: 100,
        quantity: 10,
        price: 100,
        lowStockThreshold: 10,
    }
]


export const mockGetProductsById = (id) => {
    return mockProducts.find(product => product.id === id);
}