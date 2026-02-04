// 角色-权限映射表（基于mock/roleList.js设计）
export const permissionMap = {
    // 系统管理员（Admin / SuperAdmin）
    1: {
        'add': true,
        'edit': true,
        'delete': true,
        'view': true,
        'import': true,
        'export': true,
        'approve': true,
        'manageRoles': true,
        'manageUsers': true,
        'systemSettings': true
    },
    // 仓库管理员（Warehouse Manager）
    2: {
        'add': true,
        'edit': true,
        'delete': true,
        'view': true,
        'import': true,
        'export': true,
        'approve': true,
        'stockAdjustment': true,
        'inventoryCheck': true
    },
    // 库存操作员（Stock Operator / Warehouse Staff）
    3: {
        'add': true,
        'edit': true,
        'delete': false,
        'view': true,
        'import': true,
        'export': true,
        'stockOperation': true
    },
    // 采购员（Purchaser / Buyer）
    4: {
        'add': true,
        'edit': true,
        'delete': false,
        'view': true,
        'import': true,
        'purchaseOrder': true,
        'supplierManage': true
    },
    // 销售员 / 销售主管（Sales / Sales Manager）
    5: {
        'view': true,
        'export': true,
        'salesOrder': true,
        'salesReturn': true
    },
    // 库存分析师（Inventory Analyst）
    6: {
        'view': true,
        'export': true,
        'reportView': true,
        'analytics': true
    },
    // 质量控制员（QC / Quality Officer）
    7: {
        'view': true,
        'qcMark': true,
        'qcReport': true
    },
    // 审核/审批人（Approver）
    8: {
        'view': true,
        'approve': true
    },
    // 普通用户（Basic User / Viewer）
    9: {
        'view': true,
        'export': false
    }
};