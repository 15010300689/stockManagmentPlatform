import { getRoles, getRoleIds } from '../auth';
import { permissionMap } from '../config/permissionConfig';

type PermissionMap = Record<number, Record<string, boolean>>;

interface UsePermissionConfig {
    permissionMap?: PermissionMap;
}

/**
 * 权限控制 Hook
 */
export default function usePermission(config: UsePermissionConfig = {}) {
    const currentRoles = getRoles();
    const currentRoleIds = getRoleIds();
    const { permissionMap: customPermissionMap } = config;
    const permissions = customPermissionMap || permissionMap;

    const hasPermission = (permission: string, allowedRoles?: number[]): boolean => {
        if (currentRoleIds.length === 0) return false;
        if (allowedRoles && allowedRoles.length > 0) {
            return currentRoleIds.some((roleId) => allowedRoles.includes(roleId));
        }
        return currentRoleIds.some((roleId) => permissions[roleId]?.[permission] || false);
    };

    const hasRole = (roles: number[]): boolean => {
        if (currentRoleIds.length === 0) return false;
        return currentRoleIds.some((roleId) => roles.includes(roleId));
    };

    const getCurrentRoles = () => currentRoles;
    const getCurrentRoleIds = () => currentRoleIds;

    return {
        hasPermission,
        hasRole,
        getCurrentRoles,
        getCurrentRoleIds
    };
}
