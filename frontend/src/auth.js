// 认证工具函数

const TOKEN_KEY = 'inventory_token';
const USERNAME_KEY = 'inventory_username';

/**
 * 保存token和用户名
 */
export function saveAuth(token, username) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USERNAME_KEY, username);
}

/**
 * 获取token
 */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * 获取用户名
 */
export function getUsername() {
    return localStorage.getItem(USERNAME_KEY);
}

/**
 * 清除认证信息
 */
export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
}

/**
 * 检查是否已登录
 */
export function isAuthenticated() {
    return getToken() !== null;
}

/**
 * 带认证的fetch请求
 */
export async function authFetch(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // 如果返回401，清除认证信息
    if (response.status === 401) {
        clearAuth();
        throw new Error('未登录或登录已过期');
    }
    
    return response;
}

