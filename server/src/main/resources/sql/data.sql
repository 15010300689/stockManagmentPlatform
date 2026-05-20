-- ========================================
-- 初始化数据
-- ========================================
USE stock;

-- 兼容增量升级：补齐菜单权限字段
ALTER TABLE sys_menu
  ADD COLUMN IF NOT EXISTS required_permission_code VARCHAR(100) DEFAULT NULL COMMENT '访问该菜单所需权限码，为空表示目录或公开菜单';

-- 默认角色
INSERT IGNORE INTO sys_role (id, role_name, role_code, description) VALUES
  (1, '系统管理员', 'admin',   '拥有系统所有权限'),
  (2, '仓库管理员', 'warehouse_manager', '管理仓库和库存'),
  (3, '普通用户',   'user',    '仅可查看基本信息');

-- 默认用户（密码明文，实际生产中应加密）
INSERT IGNORE INTO sys_user (id, username, password, real_name, status) VALUES
  (1, 'admin',     'admin123',     '管理员', 1),
  (2, 'user',      'user123',      '普通用户', 1),
  (3, 'warehouse', 'warehouse123', '仓库管理员', 1);

-- 用户角色关系
INSERT IGNORE INTO sys_user_role (user_id, role_id) VALUES
  (1, 1),
  (2, 3),
  (3, 2);

-- 动态菜单（可重复执行，会同步更新 required_permission_code）
INSERT INTO sys_menu (id, parent_id, name, path, required_permission_code, icon, sort_no, visible, status) VALUES
  (1, 0, '权限管理', '/permission', 'admin:menu:view', '🔒', 1, 1, 1),
  (2, 1, '角色管理', '/role', 'admin:role:view', '👥', 1, 1, 1),
  (3, 1, '用户管理', '/user', 'admin:role:view', '👨‍👩‍👧‍👦', 2, 1, 1),
  (4, 1, '菜单配置', '/permission/menu', 'admin:menu:view', '🔗', 3, 1, 1),
  (5, 0, '商品管理', '/product', 'product:view', '📦', 2, 1, 1),
  (6, 0, '仓库管理', '/storeManagement', 'inventory:stores:view', '🏠', 3, 1, 1),
  (7, 0, '仓位管理', '/positionManagement', 'inventory:positions:view', '🗺️', 4, 1, 1),
  (8, 0, '计量单位管理', '/unitManagement', 'admin:menu:view', '🧪', 5, 1, 1),
  (9, 0, '货币管理', '/currencyManagement', 'admin:menu:view', '🪙', 6, 1, 1),
  (10, 0, '运输途径管理', '/transportManagement', 'admin:menu:view', '✈️', 7, 1, 1)
ON DUPLICATE KEY UPDATE
  parent_id = VALUES(parent_id),
  name = VALUES(name),
  path = VALUES(path),
  required_permission_code = VALUES(required_permission_code),
  icon = VALUES(icon),
  sort_no = VALUES(sort_no),
  visible = VALUES(visible),
  status = VALUES(status);

-- 角色菜单关系（默认给三个角色完整菜单，后续可在权限管理页面动态调整）
INSERT IGNORE INTO sys_role_menu (role_id, menu_id)
SELECT 1 AS role_id, id AS menu_id FROM sys_menu;

INSERT IGNORE INTO sys_role_menu (role_id, menu_id)
SELECT 2 AS role_id, id AS menu_id FROM sys_menu;

INSERT IGNORE INTO sys_role_menu (role_id, menu_id)
SELECT 3 AS role_id, id AS menu_id FROM sys_menu;

-- 接口权限点（阶段B：按钮级权限 + 接口鉴权）
INSERT IGNORE INTO sys_permission (id, permission_name, permission_code, path, method, description) VALUES
  (1,  '查看商品',       'product:view',            '/api/products',                  'GET',    '商品列表查询'),
  (2,  '新增商品',       'product:add',             '/api/products',                  'POST',   '新增商品'),
  (3,  '编辑商品',       'product:edit',            '/api/product',                   'PUT',    '编辑商品'),
  (4,  '删除商品',       'product:delete',          '/api/product',                   'DELETE', '删除商品'),
  (5,  '商品详情',       'product:detail',          '/api/product',                   'GET',    '商品详情'),
  (6,  '商品入库',       'product:stockin',         '/api/stock-in',                  'POST',   '商品入库'),
  (7,  '商品出库',       'product:stockout',        '/api/stock-out',                 'POST',   '商品出库'),
  (8,  '统计信息',       'product:statistics',      '/api/statistics',                'GET',    '库存统计'),
  (9,  '低库存预警',     'product:lowstock',        '/api/low-stock',                 'GET',    '低库存预警'),
  (10, '查看仓库',       'inventory:stores:view',   '/api/stores',                    'GET',    '仓库列表'),
  (11, '查看仓位',       'inventory:positions:view','/api/positions',                 'GET',    '仓位列表'),
  (12, '分仓库存汇总',   'inventory:summary:view',  '/api/inventory/summary',         'GET',    '分仓库存汇总'),
  (13, '分仓位库存明细', 'inventory:positions:view','/api/inventory/positions',       'GET',    '分仓位库存明细'),
  (14, '库存调整',       'inventory:adjust',        '/api/inventory/adjust',          'POST',   '库存调整'),
  (24, '仓库库存查询',   'inventory:warehouse:view','/api/stores/*/inventory',        'GET',    '按仓库查库存'),
  (25, '仓位库存查询',   'inventory:position:view', '/api/positions/*/inventory',     'GET',    '按仓位查库存'),
  (27, '仓库库存查询(旧)','inventory:warehouse:view','/api/inventory/by-warehouse',  'GET',    '按仓库查库存(兼容)'),
  (28, '仓位库存查询(旧)','inventory:position:view', '/api/inventory/by-position',   'GET',    '按仓位查库存(兼容)'),
  (26, '库存流水查询',   'inventory:logs:view',     '/api/inventory/logs',            'GET',    '库存流水'),
  (29, '仓库库存概览',   'inventory:warehouse:view','/api/stores/*/inventory/overview','GET', '仓库库存概览'),
  (30, '仓位库存概览',   'inventory:position:view', '/api/positions/*/inventory/overview','GET','仓位库存概览'),
  (31, '仓位占用摘要',   'inventory:warehouse:view','/api/stores/*/position-occupancy','GET', '仓位占用摘要'),
  (15, '菜单查看',       'admin:menu:view',         '/api/admin/menus',               'GET',    '查看全部菜单'),
  (16, '菜单新增',       'admin:menu:add',          '/api/admin/menu',                'POST',   '新增菜单'),
  (17, '菜单编辑',       'admin:menu:edit',         '/api/admin/menu/*',              'PUT',    '编辑菜单'),
  (18, '角色查看',       'admin:role:view',         '/api/admin/roles',               'GET',    '查看角色列表'),
  (19, '角色菜单查看',   'admin:role:menu:view',    '/api/admin/role/*/menu-ids',     'GET',    '查看角色菜单'),
  (20, '角色菜单配置',   'admin:role:menu:save',    '/api/admin/role/*/menus',        'POST',   '保存角色菜单'),
  (21, '权限点查看',     'admin:permission:view',   '/api/admin/permissions',         'GET',    '查看权限点列表'),
  (22, '角色权限查看',   'admin:role:permission:view','/api/admin/role/*/permission-ids','GET', '查看角色权限点'),
  (23, '角色权限配置',   'admin:role:permission:save','/api/admin/role/*/permissions','POST',  '保存角色权限点');

-- 角色-权限绑定
-- 1) 系统管理员：默认拥有全部权限
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
SELECT 1 AS role_id, id AS permission_id FROM sys_permission;

-- 2) 仓库管理员：商品查看、库存操作、仓库仓位查看 + 统计/预警
INSERT IGNORE INTO sys_role_permission (role_id, permission_id) VALUES
  (2, 1), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9),
  (2,10), (2,11), (2,12), (2,13), (2,14), (2,24), (2,25), (2,26), (2,27), (2,28), (2,29), (2,30), (2,31);

-- 3) 普通用户：只读权限
INSERT IGNORE INTO sys_role_permission (role_id, permission_id) VALUES
  (3, 1), (3, 5), (3, 8), (3, 9), (3,10), (3,11), (3,12), (3,13), (3,24), (3,25), (3,26), (3,27), (3,28), (3,29), (3,30), (3,31);

-- 示例商品（id 由数据库自增；按名称去重可重复执行）
INSERT IGNORE INTO product (name, price, quantity, category) VALUES
  ('笔记本电脑', 5999.00, 50, '电子产品'),
  ('无线鼠标',   99.00,  200, '电子产品'),
  ('办公椅',     399.00,  30, '家具'),
  ('A4打印纸',   25.00,  500, '办公用品');

-- 示例仓库
INSERT IGNORE INTO warehouse (id, code, name, status, address, contact, phone) VALUES
  (1, 'WH001', '主仓库', '1', '北京市朝阳区', '张三', '13800000001'),
  (2, 'WH002', '分仓库', '1', '上海市浦东新区', '李四', '13800000002');

-- 示例仓位
INSERT IGNORE INTO position (id, warehouse_id, parent_id, code, name, type, status, max_capacity, unit) VALUES
  (1, 1, NULL, 'A',    'A区',      'area',     '1', 0,    NULL),
  (2, 1, 1,    'A-01', 'A区货架1', 'shelf',    '1', 0,    NULL),
  (3, 1, 2,    'A-01-1', 'A区货架1第1层', 'level', '1', 100, '件'),
  (4, 1, 2,    'A-01-2', 'A区货架1第2层', 'level', '1', 100, '件'),
  (5, 2, NULL, 'B',    'B区',      'area',     '1', 0,    NULL),
  (6, 2, 5,    'B-01', 'B区货架1', 'shelf',    '1', 0,    NULL);

-- 已有数据库升级（若曾插入 id=24/25 的旧 path，可执行）：
-- UPDATE sys_permission SET path='/api/stores/*/inventory' WHERE id=24;
-- UPDATE sys_permission SET path='/api/positions/*/inventory' WHERE id=25;
-- INSERT IGNORE INTO sys_permission (id, permission_name, permission_code, path, method, description) VALUES
--   (27, '仓库库存查询(旧)', 'inventory:warehouse:view', '/api/inventory/by-warehouse', 'GET', '兼容'),
--   (28, '仓位库存查询(旧)', 'inventory:position:view', '/api/inventory/by-position', 'GET', '兼容');
-- INSERT IGNORE INTO sys_role_permission (role_id, permission_id) VALUES (2,27),(2,28),(3,27),(3,28);

-- 示例分仓库存（与 product 表自增 id 1~4 对应；执行前需已有示例商品）
INSERT IGNORE INTO inventory (product_id, warehouse_id, position_id, quantity) VALUES
  (1, 1, 3, 30),
  (1, 1, 4, 20),
  (2, 1, NULL, 150),
  (2, 2, NULL, 50),
  (3, 1, 3, 30);
