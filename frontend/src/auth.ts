// 认证工具函数（TypeScript）
import http from './http';

export interface RoleItem {
    id: number;
    roleName: string;
    [key: string]: unknown;
}

const TOKEN_KEY = 'inventory_token';
const USERNAME_KEY = 'inventory_username';
const ROLES_KEY = 'inventory_roles';
const PERMISSIONS_KEY = 'inventory_permissions';

/**
 * 保存 token、用户名、角色列表、权限码
 */
export function saveAuth(
    token: string,
    username: string,
    roles: RoleItem[] = [],
    permissionCodes: string[] = []
): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USERNAME_KEY, username);
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles || []));
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissionCodes || []));
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
}

export function getRoles(): RoleItem[] {
    const rolesStr = localStorage.getItem(ROLES_KEY);
    return rolesStr ? JSON.parse(rolesStr) : [];
}

export function getRoleIds(): number[] {
    return getRoles().map((r) => Number(r.id)).filter((id) => !Number.isNaN(id));
}

export function getPermissionCodes(): string[] {
    const codes = localStorage.getItem(PERMISSIONS_KEY);
    return codes ? JSON.parse(codes) : [];
}

export function setPermissionCodes(codes: string[]): void {
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(codes || []));
}

export function hasPermission(code?: string): boolean {
    if (!code) return true;
    return getPermissionCodes().includes(code);
}

export function clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(ROLES_KEY);
    localStorage.removeItem(PERMISSIONS_KEY);
}

export function isAuthenticated(): boolean {
    return getToken() !== null;
}

export async function requestRaw(url: string, options: RequestInit = {}): Promise<Response> {
    return http.fetchLike(url, options);
}

/**
 * 带认证的请求（兼容 Response 形态）
 */
export async function requestWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await requestRaw(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        clearAuth();
        throw new Error('未登录或登录已过期');
    }

    return response;
}

/** @deprecated 请使用 requestRaw */
export const apiFetch = requestRaw;
/** @deprecated 请使用 requestWithAuth */
export const authFetch = requestWithAuth;
