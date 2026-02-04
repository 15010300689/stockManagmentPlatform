export const roleList = [
    {
        id: 1,
        roleName: '系统管理员（Admin / SuperAdmin）',
        createTime: '2026-01-05',
        roleMap: '所有菜单可见 + 所有动作许可、权限分配与角色管理、系统设置与审计日志查看',
        desc: '全系统最高权限，可管理用户、角色、权限、系统参数、日志、数据备份等。常用于公司 IT 或后台运维人员'
    },
    {
        id: 2,
        roleName: '仓库管理员（Warehouse Manager）',
        createTime: '2026-01-05',
        roleMap: '入库/出库管理、库存调整/库存盘点、库存报表/库存异常处理、库存状态/仓位配置',
        desc: '管理仓库日常运营、库存策略、库存准确性。'
    },
    {
        id: 3,
        roleName: '库存操作员（Stock Operator / Warehouse Staff）',
        createTime: '2026-01-05',
        roleMap: '扫码上架/调拨/发货/收货、批次/有效期录入、盘点确认录入、查看库存状态',
        desc: '实际执行库存操作的人。'
    },
    {
        id: 4,
        roleName: '采购员（Purchaser / Buyer）',
        createTime: '2026-01-05',
        roleMap: '创建/审批采购订单、供应商管理、采购入库处理、库存需求预警查看',
        desc: '负责商品采购订单的创建与管理。'
    },
    {
        id: 5,
        roleName: '销售员 / 销售主管（Sales / Sales Manager）',
        createTime: '2026-01-05',
        roleMap: '销售订单创建与查看、销售退货处理、销售相关库存查看',
        desc: '管理销售订单、报价、出库单。'
    },
    {
        id: 6,
        roleName: '库存分析师（Inventory Analyst）',
        createTime: '2026-01-05',
        roleMap: '报表查看、趋势分析、库存分类统计',
        desc: '查看库存数据报表、分析库存健康 & 呆滞库存。'
    },
    {
        id: 7,
        roleName: '质量控制员（QC / Quality Officer）',
        createTime: '2026-01-05',
        roleMap: '标记不合格库存、生成 QC 报表、审核质量异常流程',
        desc: '检查入库/出库货物质量，管理异常品。'
    },
    {
        id: 8,
        roleName: '审核/审批人（Approver）',
        createTime: '2026-01-05',
        roleMap: '多级审批流程、审计分离（职责分离原则）',
        desc: '对采购单、出库单、调拨单等进行审核批准。'
    },
    {
        id: 9,
        roleName: '普通用户（Basic User / Viewer）',
        createTime: '2026-01-05',
        roleMap: '查看库存、查询报表、无业务动作权限',
        desc: '只读权限或有限操作权限。'
    }
]