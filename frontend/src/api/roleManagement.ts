import http from '../http';
import { ROLES_URL } from '../http/url';

interface FetchRolesParams {
    roleName?: string;
    pageNo?: number;
    pageSize?: number;
}

interface FetchRolesResponse<T = unknown> {
    data: T[];
    total: number;
}

export const fetchRoles = async <T = unknown>(params: FetchRolesParams): Promise<FetchRolesResponse<T>> => {
    const result = await http.get<FetchRolesResponse<T>>(ROLES_URL, params as Record<string, unknown>);
    return result;
};
