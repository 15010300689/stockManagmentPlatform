export const menuItems = [
    { 
        key: '/', 
        label: '🔒 权限管理',
        children: [
            { key: '/role', label: '👥 角色管理' },
            { key: '/user', label: '👨‍👩‍👧‍👦 用户管理' },
            { key: '/permission', label: '🔗 权限管理' },
        ]
    },
    { 
        key: '/product',
        label: '📦 商品管理'
    },
    { 
        key: '/storeManagement',
        label: '🏠 仓库管理'
    },
    { 
        key: '/positionManagement',
        label: '🗺️ 仓位管理'
    },
    { 
        key: '/unitManagement',
        label: '🧪 计量单位管理'
    },
    { 
        key: '/currencyManagement',
        label: '🪙 货币管理'
    },
    { 
        key: '/transportManagement',
        label: '✈️ 运输途径管理'
    }
];