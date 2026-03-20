import http from '../http';
import { BASE_URL } from '../http/url';

const STORES_URL = `${BASE_URL}/stores`;
const POSITIONS_URL = `${BASE_URL}/positions`;

type PlainObject = Record<string, unknown>;

// 仓库管理 API
export const fetchStores = async <T = unknown>(params: PlainObject) => {
    const result = await http.get<T>(STORES_URL, params);
    return result;
};

export const createStore = async <T = unknown>(data: PlainObject) => {
    const result = await http.post<T>(STORES_URL, data);
    return result;
};

export const updateStore = async <T = unknown>(id: number | string, data: PlainObject) => {
    const result = await http.post<T>(`${STORES_URL}/${id}`, data);
    return result;
};

export const deleteStore = async <T = unknown>(id: number | string) => {
    const result = await http.post<T>(`${STORES_URL}/${id}/delete`, {});
    return result;
};

// 仓位管理 API
export const fetchPositions = async <T = unknown>(params: PlainObject) => {
    const result = await http.get<T>(POSITIONS_URL, params);
    return result;
};

export const createPosition = async <T = unknown>(data: PlainObject) => {
    const result = await http.post<T>(POSITIONS_URL, data);
    return result;
};

export const updatePosition = async <T = unknown>(id: number | string, data: PlainObject) => {
    const result = await http.post<T>(`${POSITIONS_URL}/${id}`, data);
    return result;
};

export const deletePosition = async <T = unknown>(id: number | string) => {
    const result = await http.post<T>(`${POSITIONS_URL}/${id}/delete`, {});
    return result;
};
