// 仓位数据 - 树状结构：库区 → 货架 → 层 → 仓位
import type { PositionItem } from '../types/inventory';

export const positionList: PositionItem[] = [
    // 仓库1的仓位结构
    {
        id: 1,
        warehouseId: 1,
        parentId: null,
        code: 'A区',
        name: 'A区',
        type: 'area',
        status: '1',
        maxCapacity: 1000,
        unit: '007', // 个
        createTime: '2024-01-15'
    },
    {
        id: 2,
        warehouseId: 1,
        parentId: 1,
        code: 'A-01',
        name: 'A区01号货架',
        type: 'shelf',
        status: '1',
        maxCapacity: 100,
        unit: '007',
        createTime: '2024-01-15'
    },
    {
        id: 3,
        warehouseId: 1,
        parentId: 2,
        code: 'A-01-1',
        name: 'A区01号货架第1层',
        type: 'level',
        status: '1',
        maxCapacity: 50,
        unit: '007',
        createTime: '2024-01-15'
    },
    {
        id: 4,
        warehouseId: 1,
        parentId: 3,
        code: 'A-01-1-01',
        name: 'A区01号货架第1层01号仓位',
        type: 'position',
        status: '1',
        maxCapacity: 10,
        unit: '007',
        createTime: '2024-01-15'
    },
    {
        id: 5,
        warehouseId: 1,
        parentId: 3,
        code: 'A-01-1-02',
        name: 'A区01号货架第1层02号仓位',
        type: 'position',
        status: '1',
        maxCapacity: 10,
        unit: '007',
        createTime: '2024-01-15'
    },
    {
        id: 6,
        warehouseId: 1,
        parentId: 2,
        code: 'A-01-2',
        name: 'A区01号货架第2层',
        type: 'level',
        status: '1',
        maxCapacity: 50,
        unit: '007',
        createTime: '2024-01-15'
    },
    {
        id: 7,
        warehouseId: 1,
        parentId: 6,
        code: 'A-01-2-01',
        name: 'A区01号货架第2层01号仓位',
        type: 'position',
        status: '1',
        maxCapacity: 10,
        unit: '007',
        createTime: '2024-01-15'
    },
    {
        id: 8,
        warehouseId: 1,
        parentId: 1,
        code: 'A-02',
        name: 'A区02号货架',
        type: 'shelf',
        status: '1',
        maxCapacity: 100,
        unit: '007',
        createTime: '2024-01-16'
    },
    {
        id: 9,
        warehouseId: 1,
        parentId: 8,
        code: 'A-02-1',
        name: 'A区02号货架第1层',
        type: 'level',
        status: '1',
        maxCapacity: 50,
        unit: '007',
        createTime: '2024-01-16'
    },
    {
        id: 10,
        warehouseId: 1,
        parentId: 9,
        code: 'A-02-1-01',
        name: 'A区02号货架第1层01号仓位',
        type: 'position',
        status: '1',
        maxCapacity: 10,
        unit: '007',
        createTime: '2024-01-16'
    },
    // 仓库2的仓位结构
    {
        id: 11,
        warehouseId: 2,
        parentId: null,
        code: 'B区',
        name: 'B区',
        type: 'area',
        status: '1',
        maxCapacity: 800,
        unit: '007',
        createTime: '2024-01-20'
    },
    {
        id: 12,
        warehouseId: 2,
        parentId: 11,
        code: 'B-01',
        name: 'B区01号货架',
        type: 'shelf',
        status: '1',
        maxCapacity: 80,
        unit: '007',
        createTime: '2024-01-20'
    },
    {
        id: 13,
        warehouseId: 2,
        parentId: 12,
        code: 'B-01-1',
        name: 'B区01号货架第1层',
        type: 'level',
        status: '1',
        maxCapacity: 40,
        unit: '007',
        createTime: '2024-01-20'
    },
    {
        id: 14,
        warehouseId: 2,
        parentId: 13,
        code: 'B-01-1-01',
        name: 'B区01号货架第1层01号仓位',
        type: 'position',
        status: '0',
        maxCapacity: 8,
        unit: '007',
        createTime: '2024-01-20'
    },
    // 仓库3的仓位结构
    {
        id: 15,
        warehouseId: 3,
        parentId: null,
        code: 'C区',
        name: 'C区',
        type: 'area',
        status: '0',
        maxCapacity: 600,
        unit: '007',
        createTime: '2024-02-01'
    },
    {
        id: 16,
        warehouseId: 3,
        parentId: 15,
        code: 'C-01',
        name: 'C区01号货架',
        type: 'shelf',
        status: '0',
        maxCapacity: 60,
        unit: '007',
        createTime: '2024-02-01'
    }
];
