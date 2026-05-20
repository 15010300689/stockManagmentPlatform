/** 库存概览中的商品行 */
export interface InventoryProductBrief {
    productId: number;
    productName: string;
    quantity: number;
}

/** 仓库视角：单个仓位（或仓库级）占用块 */
export interface InventorySlotOverview {
    positionId?: number | null;
    positionCode?: string;
    positionName?: string;
    type?: string;
    unit?: string;
    maxCapacity?: number;
    usedQuantity: number;
    remainingQuantity?: number | null;
    utilizationPercent?: number | null;
    skuCount: number;
    products: InventoryProductBrief[];
}

export interface WarehouseInventoryOverview {
    warehouseId: number;
    warehouseName: string;
    totalQuantity: number;
    totalSku: number;
    slotCount: number;
    slots: InventorySlotOverview[];
}

export interface PositionInventoryOverview {
    positionId: number;
    positionCode: string;
    positionName: string;
    type?: string;
    warehouseId: number;
    warehouseName: string;
    unit?: string;
    maxCapacity?: number;
    usedQuantity: number;
    remainingQuantity?: number | null;
    utilizationPercent?: number | null;
    skuCount: number;
    products: InventoryProductBrief[];
}

export interface PositionOccupancy {
    usedQuantity: number;
    skuCount: number;
    maxCapacity: number;
    unit?: string;
    remainingQuantity?: number;
    utilizationPercent?: number;
}
