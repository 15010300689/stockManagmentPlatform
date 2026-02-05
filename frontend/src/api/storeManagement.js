import http from '../http';
import { BASE_URL } from '../http/url';

const STORES_URL = `${BASE_URL}/stores`;
const POSITIONS_URL = `${BASE_URL}/positions`;

// 仓库管理 API
export const fetchStores = async (params) => {
    const result = await http.get(STORES_URL, params);
    return result;
};

export const createStore = async (data) => {
    const result = await http.post(STORES_URL, data);
    return result;
};

export const updateStore = async (id, data) => {
    const result = await http.post(`${STORES_URL}/${id}`, data);
    return result;
};

export const deleteStore = async (id) => {
    const result = await http.post(`${STORES_URL}/${id}/delete`, {});
    return result;
};

// 仓位管理 API
export const fetchPositions = async (params) => {
    const result = await http.get(POSITIONS_URL, params);
    return result;
};

export const createPosition = async (data) => {
    const result = await http.post(POSITIONS_URL, data);
    return result;
};

export const updatePosition = async (id, data) => {
    const result = await http.post(`${POSITIONS_URL}/${id}`, data);
    return result;
};

export const deletePosition = async (id) => {
    const result = await http.post(`${POSITIONS_URL}/${id}/delete`, {});
    return result;
};
