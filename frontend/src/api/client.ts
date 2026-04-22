import http from '../http';
import { clearAuth } from '../auth';

interface ApiErrorPayload {
    message?: string;
    msg?: string;
}

export async function requestWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await http.fetchLike(url, options);
    if (response.status === 401) {
        clearAuth();
        throw new Error('未登录或登录已过期');
    }
    return response;
}

export async function requestJsonWithAuth<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await requestWithAuth(url, options);
    const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload & T;
    if (!response.ok) {
        throw new Error(payload.message || payload.msg || `请求失败(${response.status})`);
    }
    return payload as T;
}

/** @deprecated 请使用 requestWithAuth */
export const request = requestWithAuth;
/** @deprecated 请使用 requestJsonWithAuth */
export const requestJson = requestJsonWithAuth;
