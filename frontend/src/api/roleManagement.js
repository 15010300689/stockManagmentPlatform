import http from '../http';
import { ROLES_URL } from '../http/url';

export const fetchRoles = async (params) => {
    const result = await http.get(ROLES_URL, params);
    return result;
}