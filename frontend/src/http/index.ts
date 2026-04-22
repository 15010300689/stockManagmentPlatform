import axios from 'axios';
import qs from 'qs';
import originJSONP from 'jsonp';
import { message } from 'antd';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { clearAuth, getToken } from '../auth';
import { isMockEnabled, mockApiFetch } from '../mock/apiMock';

type PlainObject = Record<string, unknown>;
type ErrorPayload = PlainObject & {
    code?: number | string;
    state?: number | string;
    msg?: string;
    message?: string;
};

const HTTP_STATUS_MESSAGE: Record<number, string> = {
    400: '请求参数错误',
    401: '登录状态已失效，请重新登录',
    403: '暂无权限访问该资源',
    404: '请求资源不存在',
    408: '请求超时，请稍后重试',
    409: '请求冲突，请检查后重试',
    429: '请求过于频繁，请稍后再试',
    500: '服务器开小差了，请稍后重试',
    502: '网关异常，请稍后重试',
    503: '服务暂不可用，请稍后重试',
    504: '网关超时，请稍后重试',
};

let isRedirectingToLogin = false;
const toastCache = new Map<string, number>();
const TOAST_DEDUP_WINDOW_MS = 1500;

class HttpError extends Error {
    msg: string;

    code?: number | string;

    status?: number;

    method?: string;

    url?: string;

    data?: unknown;

    isNetworkError?: boolean;

    isTimeout?: boolean;

    constructor(
        message: string,
        options: {
            code?: number | string;
            status?: number;
            method?: string;
            url?: string;
            data?: unknown;
            isNetworkError?: boolean;
            isTimeout?: boolean;
        } = {}
    ) {
        super(message);
        this.name = 'HttpError';
        this.msg = message;
        this.code = options.code;
        this.status = options.status;
        this.method = options.method;
        this.url = options.url;
        this.data = options.data;
        this.isNetworkError = options.isNetworkError;
        this.isTimeout = options.isTimeout;
    }
}

export function extractErrorMessage(error: unknown, fallback = '请求失败，请稍后重试'): string {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message || fallback;
    if (typeof error === 'object') {
        const maybe = error as { message?: string; msg?: string };
        return maybe.message || maybe.msg || fallback;
    }
    return fallback;
}

export function notifyErrorOnce(
    error: unknown,
    options: { fallback?: string; dedupKey?: string; windowMs?: number } = {}
): void {
    const fallback = options.fallback || '请求失败，请稍后重试';
    const text = extractErrorMessage(error, fallback);
    const now = Date.now();
    const key = options.dedupKey || text;
    const windowMs = options.windowMs ?? TOAST_DEDUP_WINDOW_MS;
    const lastShownAt = toastCache.get(key) || 0;
    if (now - lastShownAt < windowMs) return;
    toastCache.set(key, now);
    message.error(text);
}

class Request {
    // 域名
    host = '';

    // axios 实例
    axiosInstance = axios.create();

    constructor() {
        this.initAxios();
    }

    private handleUnauthorizedRedirect() {
        clearAuth();
        if (typeof window === 'undefined') return;

        const { pathname, search, hash } = window.location;
        if (pathname === '/login' || isRedirectingToLogin) return;

        isRedirectingToLogin = true;
        const redirect = encodeURIComponent(`${pathname}${search}${hash}`);
        window.location.replace(`/login?redirect=${redirect}`);
        window.setTimeout(() => {
            isRedirectingToLogin = false;
        }, 1000);
    }

    /** @desc 初始化 axios 实例 */
    initAxios() {
        this.axiosInstance = axios.create({
            responseType: 'json',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 20000,
        });

        // 请求拦截
        this.axiosInstance.interceptors.request.use(
            (config) => {
                let url = config.url || '';
                if (!url) {
                    throw new Error('url is error!');
                }

                if (!/^(https?:)?\/\//.test(url)) {
                    url = `${this.host}${url}`;
                }

                config.url = url;
                const token = getToken();
                if (token) {
                    const headers = (config.headers || {}) as Record<string, string>;
                    if (!headers.Authorization) {
                        headers.Authorization = `Bearer ${token}`;
                    }
                    (config as AxiosRequestConfig & { headers: Record<string, string> }).headers = headers;
                }
                config.params = {
                    [`${Date.now().toString(36).substring(3)}`]: '', // 避免接口缓存
                    ...(config.params || {}),
                };
                return config;
            },
            (error) => Promise.reject(error)
        );

        // 响应拦截
        this.axiosInstance.interceptors.response.use(
            (response) => this.responseIntercept(response),
            (error) => Promise.reject(this.normalizeAxiosError(error))
        );
    }

    private headersToRecord(headers?: HeadersInit): Record<string, string> {
        if (!headers) return {};
        if (headers instanceof Headers) {
            const result: Record<string, string> = {};
            headers.forEach((value, key) => {
                result[key] = value;
            });
            return result;
        }
        if (Array.isArray(headers)) {
            return headers.reduce<Record<string, string>>((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});
        }
        return headers as Record<string, string>;
    }

    /**
     * 统一底层请求：以 fetch 风格返回 Response，供 auth.ts 复用
     */
    async fetchLike(url: string, options: RequestInit = {}): Promise<Response> {
        if (isMockEnabled()) {
            const mockRes = await mockApiFetch(url, options);
            if (mockRes) return mockRes;
        }

        const method = (options.method || 'GET').toUpperCase();
        const headers = this.headersToRecord(options.headers);
        const body = options.body;

        try {
            const response = await this.axiosInstance.request({
                url,
                method,
                headers: headers as AxiosRequestConfig['headers'],
                data: body,
                validateStatus: () => true,
            });
            const contentType = String(response.headers?.['content-type'] || headers['Content-Type'] || 'application/json');
            const payload = typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data ?? null);
            return new Response(payload, {
                status: response.status,
                headers: {
                    'Content-Type': contentType
                }
            });
        } catch (error) {
            const mockRes = await mockApiFetch(url, options);
            if (mockRes) return mockRes;
            throw this.normalizeAxiosError(error);
        }
    }

    private normalizeBusinessError(
        payload: ErrorPayload,
        response: AxiosResponse
    ): HttpError {
        const code = payload.code !== undefined ? Number(payload.code) : undefined;
        const state = payload.state !== undefined ? Number(payload.state) : undefined;
        if (response.status === 401 || code === 401 || state === 401) {
            this.handleUnauthorizedRedirect();
        }

        const message = String(payload.msg || payload.message || '请求失败！');
        return new HttpError(message, {
            code: payload.code,
            status: response.status,
            method: response.config.method?.toUpperCase(),
            url: response.config.url,
            data: payload,
        });
    }

    private normalizeAxiosError(error: unknown): HttpError {
        if (axios.isAxiosError(error)) {
            const axiosErr = error as AxiosError<ErrorPayload>;
            const response = axiosErr.response;
            const payload = response?.data;
            const status = response?.status;
            const method = axiosErr.config?.method?.toUpperCase();
            const url = axiosErr.config?.url;

            // 1) 超时
            if (axiosErr.code === 'ECONNABORTED') {
                return new HttpError('请求超时，请稍后重试', {
                    code: axiosErr.code,
                    status,
                    method,
                    url,
                    data: payload,
                    isTimeout: true,
                    isNetworkError: !response,
                });
            }

            // 2) 无响应（断网/跨域/服务未启动）
            if (!response) {
                return new HttpError('网络异常，请检查网络连接', {
                    code: axiosErr.code,
                    method,
                    url,
                    data: payload,
                    isNetworkError: true,
                });
            }

            // 3) 有响应但失败：优先后端 msg/message
            const backendMsg = payload?.msg || payload?.message;
            if (status === 401) {
                this.handleUnauthorizedRedirect();
            }
            const message = String(
                backendMsg ||
                (status ? HTTP_STATUS_MESSAGE[status] : '') ||
                '请求失败，请稍后重试'
            );

            return new HttpError(message, {
                code: payload?.code || axiosErr.code,
                status,
                method,
                url,
                data: payload,
            });
        }

        if (error instanceof Error) {
            return new HttpError(error.message || '请求失败，请稍后重试', {
                data: error,
            });
        }

        return new HttpError('请求失败，请稍后重试', {
            data: error,
        });
    }

    /** @desc 响应拦截 */
    responseIntercept<T = unknown>(response: AxiosResponse<T>) {
        try {
            const payload = response.data as ErrorPayload | undefined;
            if (!payload || typeof payload !== 'object') {
                return response;
            }

            if ('code' in payload && Number(payload.code) !== 0) {
                return Promise.reject(this.normalizeBusinessError(payload, response));
            }

            if ('state' in payload && Number(payload.state) === -1) {
                return Promise.reject(this.normalizeBusinessError(payload, response));
            }

            return response;
        } catch (error) {
            return Promise.reject(this.normalizeAxiosError(error));
        }
    }

    /**
     * axios get 请求
     */
    private async requestMockJson<T = unknown>(url: string, options: RequestInit = {}): Promise<T | null> {
        const mockResponse = await mockApiFetch(url, options);
        if (!mockResponse) return null;
        const data = await mockResponse.json();
        return data as T;
    }

    get<T = unknown>(
        url = '',
        data: PlainObject = {},
        config: AxiosRequestConfig = {},
        resType = false
    ): Promise<T> {
        const mergedConfig: AxiosRequestConfig = {
            params: {
                ...data
            },
            ...config,
        };

        if (isMockEnabled()) {
            return this.requestMockJson<T>(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            }).then((data) => {
                if (data !== null) return data;
                return this.axiosInstance
                    .get(url, mergedConfig)
                    .then((res) => (resType ? (res as unknown as T) : (res.data as T)));
            });
        }

        return this.axiosInstance
            .get(url, mergedConfig)
            .then((res) => (resType ? (res as unknown as T) : (res.data as T)))
            .catch(async (error) => {
                const mockData = await this.requestMockJson<T>(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (mockData !== null) return mockData;
                throw error;
            });
    }

    /**
     * axios post 请求封装
     */
    post<T = unknown>(
        url = '',
        data: PlainObject = {},
        config: AxiosRequestConfig = {},
        resType = false
    ): Promise<T> {
        const requestData = qs.stringify({ ...data });

        if (isMockEnabled()) {
            return this.requestMockJson<T>(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                body: requestData,
            }).then((data) => {
                if (data !== null) return data;
                return this.axiosInstance
                    .post(url, requestData, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                        },
                        ...config,
                    })
                    .then((res) => (resType ? (res as unknown as T) : (res.data as T)));
            });
        }

        return this.axiosInstance
            .post(url, requestData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                },
                ...config,
            })
            .then((res) => (resType ? (res as unknown as T) : (res.data as T)))
            .catch(async (error) => {
                const mockData = await this.requestMockJson<T>(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                    body: requestData,
                });
                if (mockData !== null) return mockData;
                throw error;
            });
    }

    /**
     * 上传请求封装
     */
    upload<T = unknown>(
        url = '',
        formData: FormData,
        config: AxiosRequestConfig = {}
    ): Promise<T> {
        return this.axiosInstance
            .post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                ...config,
            })
            .then((res) => res.data as T);
    }

    /**
     * jsonp
     */
    jsonp<T = unknown>(
        url = '',
        data: PlainObject = {},
        option: PlainObject = {}
    ): Promise<T> {
        function param(dataObj: PlainObject) {
            let str = '';
            const keys = Object.keys(dataObj);
            for (let i = 0; i < keys.length; i += 1) {
                const key = keys[i];
                const value = dataObj[key] !== undefined ? dataObj[key] : '';
                str += `&${key}=${encodeURIComponent(String(value))}`;
            }
            return str ? str.substring(1) : '';
        }

        url += (url.indexOf('?') < 0 ? '?' : '&') + param({ ...data });

        return new Promise((resolve, reject) => {
            originJSONP(url, option, (err: Error | null, result: T) => {
                if (!err) {
                    resolve(result);
                } else {
                    reject(err);
                }
            });
        });
    }
}

const http = new Request();

export default http;
