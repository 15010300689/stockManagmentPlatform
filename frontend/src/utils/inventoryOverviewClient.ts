import type {
    InventoryProductBrief,
    InventorySlotOverview,
    PositionInventoryOverview,
    PositionOccupancy,
    WarehouseInventoryOverview,
} from '../types/inventoryOverview';

export interface FlatInventoryRow {
    productId: number;
    productName: string;
    warehouseId: number;
    warehouseName?: string;
    positionId?: number | null;
    positionCode?: string;
    positionName?: string;
    quantity: number;
}

export interface PositionMeta {
    id: number;
    code: string;
    name?: string;
    type?: string;
    maxCapacity?: number;
    unit?: string;
}

function capacityMetrics(used: number, maxCapacity?: number) {
    const max = maxCapacity ?? 0;
    if (max > 0) {
        return {
            maxCapacity: max,
            usedQuantity: used,
            remainingQuantity: Math.max(max - used, 0),
            utilizationPercent: Math.min(100, Math.round((used * 100) / max)),
        };
    }
    return {
        maxCapacity: 0,
        usedQuantity: used,
        remainingQuantity: null as number | null,
        utilizationPercent: null as number | null,
    };
}

/** 用已有「扁平库存 + 仓位列表」接口在前端组装仓库概览（兼容未重启的后端） */
export function buildWarehouseOverviewFromFlat(
    warehouseId: number,
    warehouseName: string,
    rows: FlatInventoryRow[],
    positions: PositionMeta[]
): WarehouseInventoryOverview {
    const positionMap = new Map<number, PositionMeta>();
    positions.forEach((p) => positionMap.set(p.id, p));

    const grouped = new Map<number | 'wh', FlatInventoryRow[]>();
    rows.forEach((row) => {
        const key = row.positionId == null ? 'wh' : row.positionId;
        const list = grouped.get(key) ?? [];
        list.push(row);
        grouped.set(key, list);
    });

    const slots: InventorySlotOverview[] = [];

    const whList = grouped.get('wh');
    if (whList?.length) {
        const used = whList.reduce((s, r) => s + r.quantity, 0);
        const products: InventoryProductBrief[] = whList.map((r) => ({
            productId: r.productId,
            productName: r.productName,
            quantity: r.quantity,
        }));
        slots.push({
            positionId: null,
            positionCode: '—',
            positionName: '仓库级（未指定仓位）',
            type: 'warehouse',
            unit: '件',
            skuCount: products.length,
            products,
            ...capacityMetrics(used, 0),
        });
    }

    grouped.forEach((list, key) => {
        if (key === 'wh') return;
        const posId = key as number;
        const meta = positionMap.get(posId);
        const used = list.reduce((s, r) => s + r.quantity, 0);
        const products: InventoryProductBrief[] = list.map((r) => ({
            productId: r.productId,
            productName: r.productName,
            quantity: r.quantity,
        }));
        slots.push({
            positionId: posId,
            positionCode: meta?.code ?? list[0]?.positionCode ?? String(posId),
            positionName: meta?.name ?? list[0]?.positionName ?? '',
            type: meta?.type,
            unit: meta?.unit || '件',
            skuCount: products.length,
            products,
            ...capacityMetrics(used, meta?.maxCapacity),
        });
    });

    slots.sort((a, b) => {
        if (a.positionId == null) return -1;
        if (b.positionId == null) return 1;
        return String(a.positionCode).localeCompare(String(b.positionCode));
    });

    const totalQuantity = rows.reduce((s, r) => s + r.quantity, 0);
    return {
        warehouseId,
        warehouseName,
        slots,
        totalQuantity,
        totalSku: rows.length,
        slotCount: slots.length,
    };
}

/** 用已有扁平库存 + 仓位元数据组装仓位概览 */
/** 从扁平库存生成仓位占用 Map（兼容 position-occupancy 404） */
export function buildOccupancyMapFromFlat(
    rows: FlatInventoryRow[],
    positions: PositionMeta[]
): Record<string, PositionOccupancy> {
    const positionMap = new Map(positions.map((p) => [p.id, p]));
    const map: Record<string, PositionOccupancy> = {};
    const grouped = new Map<number, FlatInventoryRow[]>();
    rows.forEach((row) => {
        if (row.positionId == null) return;
        const list = grouped.get(row.positionId) ?? [];
        list.push(row);
        grouped.set(row.positionId, list);
    });
    grouped.forEach((list, posId) => {
        const meta = positionMap.get(posId);
        const used = list.reduce((s, r) => s + r.quantity, 0);
        const max = meta?.maxCapacity ?? 0;
        const unit = meta?.unit || '件';
        const entry: PositionOccupancy = {
            usedQuantity: used,
            skuCount: list.length,
            maxCapacity: max,
            unit,
        };
        if (max > 0) {
            entry.remainingQuantity = Math.max(max - used, 0);
            entry.utilizationPercent = Math.min(100, Math.round((used * 100) / max));
        }
        map[String(posId)] = entry;
    });
    return map;
}

export function buildPositionOverviewFromFlat(
    meta: PositionMeta,
    warehouseName: string,
    rows: FlatInventoryRow[]
): PositionInventoryOverview {
    const used = rows.reduce((s, r) => s + r.quantity, 0);
    const products: InventoryProductBrief[] = rows.map((r) => ({
        productId: r.productId,
        productName: r.productName,
        quantity: r.quantity,
    }));
    return {
        positionId: meta.id,
        positionCode: meta.code,
        positionName: meta.name || meta.code,
        type: meta.type,
        warehouseId: rows[0]?.warehouseId ?? 0,
        warehouseName,
        unit: meta.unit || '件',
        skuCount: products.length,
        products,
        ...capacityMetrics(used, meta.maxCapacity),
    };
}
