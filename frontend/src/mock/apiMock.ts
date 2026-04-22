import { mockProducts } from './productManagement';
import { roleList } from './roleList';
import { storeList } from './storeList';
import { positionList } from './positionList';
import { userList } from './userList';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface MenuRecord {
    id: number;
    parentId: number;
    name: string;
    path: string;
    requiredPermissionCode?: string;
    icon?: string;
    sortNo: number;
    visible: number;
    status: number;
}

interface PermissionRecord {
    id: number;
    permissionName: string;
    permissionCode: string;
    method: string;
    path: string;
}

const FORCE_MOCK_KEY = 'inventory_force_mock';
const MOCK_DELAY_MS = 120;
const TOKEN_PREFIX = 'mock-token-';

const productDb = [...mockProducts];
const storeDb = [...storeList];
const positionDb = [...positionList];
const roleDb = roleList.map((r) => ({
    id: r.id,
    roleName: r.roleName,
    roleCode: `ROLE_${r.id}`,
    createTime: r.createTime,
    roleMap: r.roleMap,
    desc: r.desc,
}));
const userDb = userList.map((u) => ({
    id: u.id,
    userName: u.userName,
    createTime: u.createTime,
    roleList: u.roleList
}));

const permissionDb: PermissionRecord[] = [
    { id: 0, permissionName: '查看商品', permissionCode: 'product:view', method: 'GET', path: '/api/products' },
    { id: 1, permissionName: '新增商品', permissionCode: 'product:add', method: 'POST', path: '/api/product' },
    { id: 2, permissionName: '编辑商品', permissionCode: 'product:edit', method: 'PUT', path: '/api/product' },
    { id: 3, permissionName: '删除商品', permissionCode: 'product:delete', method: 'DELETE', path: '/api/product' },
    { id: 4, permissionName: '查看库存', permissionCode: 'product:detail', method: 'GET', path: '/api/product' },
    { id: 5, permissionName: '库存统计', permissionCode: 'product:statistics', method: 'GET', path: '/api/statistics' },
    { id: 6, permissionName: '低库存预警', permissionCode: 'product:lowstock', method: 'GET', path: '/api/low-stock' },
    { id: 7, permissionName: '查看仓库', permissionCode: 'inventory:stores:view', method: 'GET', path: '/api/stores' },
    { id: 8, permissionName: '查看仓位', permissionCode: 'inventory:positions:view', method: 'GET', path: '/api/positions' },
    { id: 9, permissionName: '菜单查看', permissionCode: 'admin:menu:view', method: 'GET', path: '/api/admin/menus' },
    { id: 10, permissionName: '角色查看', permissionCode: 'admin:role:view', method: 'GET', path: '/api/admin/roles' },
];

const roleMenuMap = new Map<number, number[]>([
    [1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
    [2, [5, 6, 7]],
    [9, [5]],
]);

const rolePermissionMap = new Map<number, number[]>([
    [1, permissionDb.map((p) => p.id)],
    [2, [0, 1, 2, 3, 4, 5, 6, 7, 8]],
    [9, [0, 4, 5, 7, 8]],
]);

let menuDb: MenuRecord[] = [
    { id: 1, parentId: 0, name: '权限管理', path: '/permission', icon: '🔒', sortNo: 1, visible: 1, status: 1 },
    { id: 2, parentId: 1, name: '角色管理', path: '/role', requiredPermissionCode: 'admin:role:view', icon: '👥', sortNo: 1, visible: 1, status: 1 },
    { id: 3, parentId: 1, name: '用户管理', path: '/user', requiredPermissionCode: 'admin:role:view', icon: '👨‍👩‍👧‍👦', sortNo: 2, visible: 1, status: 1 },
    { id: 4, parentId: 1, name: '菜单配置', path: '/permission/menu', requiredPermissionCode: 'admin:menu:view', icon: '🔗', sortNo: 3, visible: 1, status: 1 },
    { id: 5, parentId: 0, name: '商品管理', path: '/product', requiredPermissionCode: 'product:view', icon: '📦', sortNo: 2, visible: 1, status: 1 },
    { id: 6, parentId: 0, name: '仓库管理', path: '/storeManagement', requiredPermissionCode: 'inventory:stores:view', icon: '🏠', sortNo: 3, visible: 1, status: 1 },
    { id: 7, parentId: 0, name: '仓位管理', path: '/positionManagement', requiredPermissionCode: 'inventory:positions:view', icon: '🗺️', sortNo: 4, visible: 1, status: 1 },
    { id: 8, parentId: 0, name: '计量单位管理', path: '/unitManagement', requiredPermissionCode: 'admin:menu:view', icon: '🧪', sortNo: 5, visible: 1, status: 1 },
    { id: 9, parentId: 0, name: '货币管理', path: '/currencyManagement', requiredPermissionCode: 'admin:menu:view', icon: '🪙', sortNo: 6, visible: 1, status: 1 },
    { id: 10, parentId: 0, name: '运输途径管理', path: '/transportManagement', requiredPermissionCode: 'admin:menu:view', icon: '✈️', sortNo: 7, visible: 1, status: 1 },
];

const permissionCodeById = new Map(permissionDb.map((p) => [p.id, p.permissionCode]));

function wait(ms: number) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

function jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

function toURL(url: string): URL {
    return new URL(url, window.location.origin);
}

function isApiPath(pathname: string): boolean {
    return pathname.startsWith('/api/');
}

function parseRoleIdsFromStorage(): number[] {
    const roleStr = localStorage.getItem('inventory_roles');
    if (!roleStr) return [1];
    try {
        const arr = JSON.parse(roleStr) as Array<{ id: number }>;
        return arr.map((i) => Number(i.id)).filter((id) => !Number.isNaN(id));
    } catch {
        return [1];
    }
}

function getPermissionCodesByRoleIds(roleIds: number[]): string[] {
    const codes = new Set<string>();
    roleIds.forEach((roleId) => {
        const ids = rolePermissionMap.get(roleId) || [];
        ids.forEach((id) => {
            const code = permissionCodeById.get(id);
            if (code) codes.add(code);
        });
    });
    return [...codes];
}

function parseBody(body: BodyInit | null | undefined, contentType = ''): Record<string, unknown> {
    if (!body) return {};
    if (typeof body === 'string') {
        if (contentType.includes('application/json')) {
            try {
                return JSON.parse(body) as Record<string, unknown>;
            } catch {
                return {};
            }
        }
        if (contentType.includes('application/x-www-form-urlencoded')) {
            const params = new URLSearchParams(body);
            const result: Record<string, unknown> = {};
            params.forEach((value, key) => {
                result[key] = value;
            });
            return result;
        }
        return {};
    }
    return {};
}

function toMenuTreeByRole(roleIds: number[]) {
    const allowIds = new Set<number>();
    const permissionCodes = new Set(getPermissionCodesByRoleIds(roleIds));
    roleIds.forEach((roleId) => {
        (roleMenuMap.get(roleId) || []).forEach((id) => allowIds.add(id));
    });
    const visibleMenus = menuDb
        .filter((m) => m.visible === 1 && m.status === 1 && allowIds.has(m.id))
        .sort((a, b) => a.sortNo - b.sortNo);

    const menuById = new Map(visibleMenus.map((m) => [m.id, m]));
    const childrenByParent = new Map<number, MenuRecord[]>();
    visibleMenus.forEach((menu) => {
        if (!childrenByParent.has(menu.parentId)) {
            childrenByParent.set(menu.parentId, []);
        }
        childrenByParent.get(menu.parentId)?.push(menu);
    });

    const keepIds = new Set<number>();
    const markKeep = (menu: MenuRecord): boolean => {
        const children = childrenByParent.get(menu.id) || [];
        const hasChild = children.some((child) => markKeep(child));
        const selfAllowed = !menu.requiredPermissionCode || permissionCodes.has(menu.requiredPermissionCode);
        if (selfAllowed || hasChild) {
            keepIds.add(menu.id);
            return true;
        }
        return false;
    };
    (childrenByParent.get(0) || []).forEach((root) => {
        markKeep(root);
    });

    const byParent = new Map<number, MenuRecord[]>();
    visibleMenus.forEach((m) => {
        if (!keepIds.has(m.id)) return;
        if (!byParent.has(m.parentId)) byParent.set(m.parentId, []);
        byParent.get(m.parentId)?.push(m);
    });

    const build = (parentId: number): Array<{ key: string; label: string; children?: unknown[] }> => {
        const list = byParent.get(parentId) || [];
        return list.map((item) => {
            const children = build(item.id);
            return {
                key: item.path,
                label: item.icon ? `${item.icon} ${item.name}` : item.name,
                children: children.length > 0 ? children : undefined
            };
        });
    };
    const tree = build(0);
    return tree;
}

export function isMockEnabled(): boolean {
    return import.meta.env.VITE_FORCE_MOCK === 'true' || localStorage.getItem(FORCE_MOCK_KEY) === '1';
}

export function shouldFallbackToMockByResponse(url: string, response: Response): boolean {
    if (!isApiPath(toURL(url).pathname)) return false;
    return response.status >= 500 || response.status === 404;
}

export async function mockApiFetch(url: string, options: RequestInit = {}): Promise<Response | null> {
    const parsedUrl = toURL(url);
    const pathname = parsedUrl.pathname;
    if (!isApiPath(pathname)) return null;

    const method = (options.method || 'GET').toUpperCase() as Method;
    const headers = (options.headers || {}) as Record<string, string>;
    const body = parseBody(options.body, headers['Content-Type'] || headers['content-type'] || '');

    await wait(MOCK_DELAY_MS);

    if (pathname === '/api/login' && method === 'POST') {
        const username = String(body.username || '');
        const password = String(body.password || '');
        if (!((username === 'admin' && password === 'admin123') || (username === 'user' && password === 'user123'))) {
            return jsonResponse({ success: false, message: '用户名或密码错误(mock)' }, 401);
        }
        const roleList = username === 'admin'
            ? [{ id: 1, roleName: '系统管理员' }]
            : [{ id: 9, roleName: '普通用户' }];
        const permissionCodes = getPermissionCodesByRoleIds(roleList.map((r) => r.id));
        return jsonResponse({
            success: true,
            token: `${TOKEN_PREFIX}${username}`,
            username,
            roleList,
            permissionCodes
        });
    }

    if (pathname === '/api/logout' && method === 'POST') {
        return jsonResponse({ success: true, message: '退出成功(mock)' });
    }

    if (pathname === '/api/auth/menus' && method === 'GET') {
        return jsonResponse(toMenuTreeByRole(parseRoleIdsFromStorage()));
    }

    if (pathname === '/api/auth/permissions' && method === 'GET') {
        return jsonResponse(getPermissionCodesByRoleIds(parseRoleIdsFromStorage()));
    }

    if (pathname === '/api/products' && method === 'GET') {
        const name = (parsedUrl.searchParams.get('name') || '').toLowerCase();
        const pageNo = Math.max(Number(parsedUrl.searchParams.get('pageNo') || 1), 1);
        const pageSize = Math.max(Number(parsedUrl.searchParams.get('pageSize') || 10), 1);
        const list = name
            ? productDb.filter((p) => p.name.toLowerCase().includes(name))
            : productDb;
        const start = (pageNo - 1) * pageSize;
        const end = start + pageSize;
        return jsonResponse({
            data: list.slice(start, end),
            total: list.length,
            pageNo,
            pageSize
        });
    }

    if (pathname === '/api/products' && method === 'POST') {
        const name = String(body.name || '').trim();
        if (!name) {
            return jsonResponse({ success: false, message: '商品名称不能为空(mock)' }, 400);
        }
        const dup = productDb.find((p) => String(p.name).trim() === name);
        if (dup) {
            return jsonResponse({ success: false, message: '商品名称已存在(mock)' }, 400);
        }
        const nextId = Math.max(0, ...productDb.map((p) => Number(p.id) || 0)) + 1;
        const row = {
            id: nextId,
            name,
            category: String(body.category ?? ''),
            price: Number(body.price ?? 0),
            quantity: 0,
            safeStock: body.safeStock != null && body.safeStock !== '' ? Number(body.safeStock) : undefined,
            status: body.status != null ? Number(body.status) : 1,
        };
        productDb.push(row);
        return jsonResponse({ success: true, message: '商品添加成功(mock)', data: row });
    }

    if (pathname === '/api/product' && method === 'GET') {
        const id = parsedUrl.searchParams.get('id');
        const item = productDb.find((p) => String(p.id) === String(id));
        return item ? jsonResponse(item) : jsonResponse({ message: '商品不存在(mock)' }, 404);
    }

    if (pathname === '/api/product' && method === 'PUT') {
        const id = parsedUrl.searchParams.get('id');
        const item = productDb.find((p) => String(p.id) === String(id));
        if (!item) {
            return jsonResponse({ success: false, message: '商品不存在(mock)' }, 404);
        }
        const name = String(body.name ?? item.name).trim();
        if (!name) {
            return jsonResponse({ success: false, message: '商品名称不能为空(mock)' }, 400);
        }
        const clash = productDb.find((p) => String(p.id) !== String(id) && String(p.name).trim() === name);
        if (clash) {
            return jsonResponse({ success: false, message: '商品名称已存在(mock)' }, 400);
        }
        Object.assign(item, {
            name,
            category: body.category != null ? String(body.category) : item.category,
            price: body.price != null ? Number(body.price) : item.price,
            safeStock: body.safeStock !== undefined && body.safeStock !== '' ? Number(body.safeStock) : (item as { safeStock?: number }).safeStock,
            status: body.status != null ? Number(body.status) : (item as { status?: number }).status,
        });
        return jsonResponse({ success: true, message: '商品更新成功(mock)' });
    }

    if (pathname === '/api/product' && method === 'DELETE') {
        const id = parsedUrl.searchParams.get('id');
        const idx = productDb.findIndex((p) => String(p.id) === String(id));
        if (idx < 0) return jsonResponse({ success: false, message: '商品不存在(mock)' }, 404);
        productDb.splice(idx, 1);
        return jsonResponse({ success: true, message: '删除成功(mock)' });
    }

    if (pathname === '/api/statistics' && method === 'GET') {
        const categories = [...new Set(productDb.map((p) => p.category))];
        const totalValue = productDb.reduce((sum, p) => sum + p.price * p.quantity, 0);
        return jsonResponse({
            productCount: productDb.length,
            totalValue,
            categories
        });
    }

    if (pathname === '/api/low-stock' && method === 'GET') {
        const threshold = Number(parsedUrl.searchParams.get('threshold') || 10);
        const list = productDb.filter((p: { quantity: number; safeStock?: number }) => {
            const ss = p.safeStock;
            if (ss != null && Number.isFinite(Number(ss))) {
                return p.quantity < Number(ss);
            }
            return p.quantity < threshold;
        });
        return jsonResponse(list);
    }

    if ((pathname === '/api/stock-in' || pathname === '/api/stock-out') && method === 'POST') {
        const id = String(body.id ?? '');
        const amount = Number(body.amount || 0);
        const item = productDb.find((p) => String(p.id) === id);
        if (!item) return jsonResponse({ success: false, message: '商品不存在(mock)' }, 404);
        if (pathname.endsWith('stock-out') && item.quantity < amount) {
            return jsonResponse({ success: false, message: '库存不足(mock)' }, 400);
        }
        item.quantity = pathname.endsWith('stock-in') ? item.quantity + amount : item.quantity - amount;
        item.totalValue = item.quantity * item.price;
        return jsonResponse({ success: true, message: '库存操作成功(mock)' });
    }

    if (pathname === '/api/admin/menus' && method === 'GET') {
        return jsonResponse(menuDb);
    }

    if (pathname === '/api/admin/menu' && method === 'POST') {
        const id = Math.max(...menuDb.map((m) => m.id), 0) + 1;
        const record: MenuRecord = {
            id,
            parentId: Number(body.parentId || 0),
            name: String(body.name || ''),
            path: String(body.path || ''),
            requiredPermissionCode: body.requiredPermissionCode != null
                ? String(body.requiredPermissionCode || '').trim() || undefined
                : undefined,
            icon: String(body.icon || ''),
            sortNo: Number(body.sortNo || 0),
            visible: Number(body.visible ?? 1),
            status: Number(body.status ?? 1),
        };
        menuDb.push(record);
        return jsonResponse({ success: true, message: '新增成功(mock)' });
    }

    if (/^\/api\/admin\/menu\/\d+$/.test(pathname) && method === 'PUT') {
        const id = Number(pathname.split('/').pop());
        const target = menuDb.find((m) => m.id === id);
        if (!target) return jsonResponse({ success: false, message: '菜单不存在(mock)' }, 404);
        Object.assign(target, {
            parentId: Number(body.parentId ?? target.parentId),
            name: String(body.name ?? target.name),
            path: String(body.path ?? target.path),
            requiredPermissionCode: body.requiredPermissionCode !== undefined
                ? (String(body.requiredPermissionCode || '').trim() || undefined)
                : target.requiredPermissionCode,
            icon: String(body.icon ?? (target.icon || '')),
            sortNo: Number(body.sortNo ?? target.sortNo),
            visible: Number(body.visible ?? target.visible),
            status: Number(body.status ?? target.status),
        });
        return jsonResponse({ success: true, message: '更新成功(mock)' });
    }

    if (pathname === '/api/admin/roles' && method === 'GET') {
        return jsonResponse(roleDb);
    }

    if (pathname === '/api/admin/permissions' && method === 'GET') {
        return jsonResponse(permissionDb);
    }

    const roleMenuMatch = pathname.match(/^\/api\/admin\/role\/(\d+)\/menu-ids$/);
    if (roleMenuMatch && method === 'GET') {
        const roleId = Number(roleMenuMatch[1]);
        return jsonResponse(roleMenuMap.get(roleId) || []);
    }

    const rolePermissionMatch = pathname.match(/^\/api\/admin\/role\/(\d+)\/permission-ids$/);
    if (rolePermissionMatch && method === 'GET') {
        const roleId = Number(rolePermissionMatch[1]);
        return jsonResponse(rolePermissionMap.get(roleId) || []);
    }

    const saveRoleMenusMatch = pathname.match(/^\/api\/admin\/role\/(\d+)\/menus$/);
    if (saveRoleMenusMatch && method === 'POST') {
        const roleId = Number(saveRoleMenusMatch[1]);
        const ids = Array.isArray(body.menuIds) ? body.menuIds.map((v) => Number(v)) : [];
        roleMenuMap.set(roleId, ids);
        return jsonResponse({ success: true, message: '角色菜单已保存(mock)' });
    }

    const saveRolePermissionsMatch = pathname.match(/^\/api\/admin\/role\/(\d+)\/permissions$/);
    if (saveRolePermissionsMatch && method === 'POST') {
        const roleId = Number(saveRolePermissionsMatch[1]);
        const ids = Array.isArray(body.permissionIds) ? body.permissionIds.map((v) => Number(v)) : [];
        rolePermissionMap.set(roleId, ids);
        return jsonResponse({ success: true, message: '角色权限已保存(mock)' });
    }

    if (pathname === '/api/roles' && method === 'GET') {
        const roleName = (parsedUrl.searchParams.get('roleName') || '').toLowerCase();
        const pageNo = Math.max(Number(parsedUrl.searchParams.get('pageNo') || 1), 1);
        const pageSize = Math.max(Number(parsedUrl.searchParams.get('pageSize') || 10), 1);
        const filtered = roleDb.filter((item) => (
            !roleName || item.roleName.toLowerCase().includes(roleName)
        ));
        const start = (pageNo - 1) * pageSize;
        const end = start + pageSize;
        return jsonResponse({
            data: filtered.slice(start, end),
            total: filtered.length,
            pageNo,
            pageSize
        });
    }

    if (pathname === '/api/users' && method === 'GET') {
        const userName = (parsedUrl.searchParams.get('userName') || '').toLowerCase();
        const pageNo = Math.max(Number(parsedUrl.searchParams.get('pageNo') || 1), 1);
        const pageSize = Math.max(Number(parsedUrl.searchParams.get('pageSize') || 10), 1);
        const filtered = userDb.filter((item) => (
            !userName || item.userName.toLowerCase().includes(userName)
        ));
        const start = (pageNo - 1) * pageSize;
        const end = start + pageSize;
        return jsonResponse({
            data: filtered.slice(start, end),
            total: filtered.length,
            pageNo,
            pageSize
        });
    }

    if (pathname === '/api/user' && method === 'POST') {
        const userName = String(body.userName || '').trim();
        const roleIds = Array.isArray(body.roleIds) ? body.roleIds.map((item) => Number(item)) : [];
        if (!userName) {
            return jsonResponse({ success: false, message: '用户名不能为空(mock)' }, 400);
        }
        if (roleIds.length === 0) {
            return jsonResponse({ success: false, message: '请至少选择一个角色(mock)' }, 400);
        }
        const conflict = userDb.find((item) => item.userName === userName);
        if (conflict) {
            return jsonResponse({ success: false, message: '用户名已存在(mock)' }, 400);
        }
        const nextId = Math.max(0, ...userDb.map((item) => Number(item.id) || 0)) + 1;
        const roles = roleDb
            .filter((role) => roleIds.includes(role.id))
            .map((role) => ({ id: role.id, roleName: role.roleName }));
        userDb.unshift({
            id: nextId,
            userName,
            createTime: new Date().toISOString(),
            roleList: roles
        });
        return jsonResponse({ success: true, message: '新增用户成功(mock)' });
    }

    const updateUserMatch = pathname.match(/^\/api\/user\/(\d+)$/);
    if (updateUserMatch && method === 'PUT') {
        const userId = Number(updateUserMatch[1]);
        const userName = String(body.userName || '').trim();
        const roleIds = Array.isArray(body.roleIds) ? body.roleIds.map((item) => Number(item)) : [];
        const target = userDb.find((item) => item.id === userId);
        if (!target) {
            return jsonResponse({ success: false, message: '用户不存在(mock)' }, 404);
        }
        if (!userName) {
            return jsonResponse({ success: false, message: '用户名不能为空(mock)' }, 400);
        }
        if (roleIds.length === 0) {
            return jsonResponse({ success: false, message: '请至少选择一个角色(mock)' }, 400);
        }
        const conflict = userDb.find((item) => item.id !== userId && item.userName === userName);
        if (conflict) {
            return jsonResponse({ success: false, message: '用户名已存在(mock)' }, 400);
        }
        const roles = roleDb
            .filter((role) => roleIds.includes(role.id))
            .map((role) => ({ id: role.id, roleName: role.roleName }));
        Object.assign(target, {
            userName,
            roleList: roles
        });
        return jsonResponse({ success: true, message: '编辑用户成功(mock)' });
    }

    if (pathname === '/api/stores' && method === 'GET') {
        const keyword = (parsedUrl.searchParams.get('keyword') || '').toLowerCase();
        const status = parsedUrl.searchParams.get('status') || '';
        const pageNo = parsedUrl.searchParams.get('pageNo');
        const pageSize = parsedUrl.searchParams.get('pageSize');
        const filtered = storeDb.filter((item) => {
            const matchKeyword = !keyword
                || item.code.toLowerCase().includes(keyword)
                || item.name.toLowerCase().includes(keyword);
            const matchStatus = !status || String(item.status) === status;
            return matchKeyword && matchStatus;
        });

        if (!pageNo || !pageSize) {
            return jsonResponse({ data: filtered, total: filtered.length });
        }

        const safePageNo = Math.max(Number(pageNo), 1);
        const safePageSize = Math.max(Number(pageSize), 1);
        const start = (safePageNo - 1) * safePageSize;
        const end = start + safePageSize;
        return jsonResponse({
            data: filtered.slice(start, end),
            total: filtered.length,
            pageNo: safePageNo,
            pageSize: safePageSize
        });
    }

    if (pathname === '/api/positions' && method === 'GET') {
        const warehouseId = parsedUrl.searchParams.get('warehouseId');
        const code = (parsedUrl.searchParams.get('code') || '').toLowerCase();
        const type = parsedUrl.searchParams.get('type') || '';
        const status = parsedUrl.searchParams.get('status') || '';
        const pageNo = parsedUrl.searchParams.get('pageNo');
        const pageSize = parsedUrl.searchParams.get('pageSize');
        const filtered = positionDb.filter((item) => {
            const matchWarehouse = !warehouseId || String(item.warehouseId) === warehouseId;
            const matchCode = !code || item.code.toLowerCase().includes(code);
            const matchType = !type || String(item.type) === type;
            const matchStatus = !status || String(item.status) === status;
            return matchWarehouse && matchCode && matchType && matchStatus;
        });

        if (!pageNo || !pageSize) {
            return jsonResponse({ data: filtered, total: filtered.length });
        }

        const safePageNo = Math.max(Number(pageNo), 1);
        const safePageSize = Math.max(Number(pageSize), 1);
        const start = (safePageNo - 1) * safePageSize;
        const end = start + safePageSize;
        return jsonResponse({
            data: filtered.slice(start, end),
            total: filtered.length,
            pageNo: safePageNo,
            pageSize: safePageSize
        });
    }

    return null;
}
