import { getRoles, getRoleIds } from '../auth';
import { roleList } from '../mock/roleList';
import { permissionMap } from '../config/permissionConfig';


/**
 * 权限控制Hook
 * @param {Object} [config] - 配置项
 * @param {Object} [config.permissionMap] - 自定义权限映射表
 */
export default function usePermission(config = {}) {
    const currentRoles = getRoles();
    const currentRoleIds = getRoleIds();
    const { permissionMap: customPermissionMap } = config;
    const permissions = customPermissionMap || permissionMap;
  
    /**
     * 检查是否有权限
     * @param {string} permission - 权限标识
     * @param {Array<number>} [allowedRoles] - 允许的角色ID列表（可选）
     * @returns {boolean}
     */
    const hasPermission = (permission, allowedRoles) => {
        // 如果没有登录，没有权限
        if (currentRoleIds.length === 0) return false;
        
        // 如果指定了角色列表，检查当前角色是否在列表中
        if (allowedRoles && allowedRoles.length > 0) {
            return currentRoleIds.some(roleId => allowedRoles.includes(roleId));
        }
        
        // 否则使用权限映射表，只要有一个角色有此权限就返回true
        return currentRoleIds.some(roleId => permissions[roleId]?.[permission] || false);
    };
  
    /**
     * 检查是否有指定角色
     * @param {Array<number>} roles - 角色ID列表
     * @returns {boolean}
     */
    const hasRole = (roles) => {
        if (currentRoleIds.length === 0) return false;
        return currentRoleIds.some(roleId => roles.includes(roleId));
    };
  
    /**
     * 获取当前用户角色
     * @returns {Array<Object>}
     */
    const getCurrentRoles = () => {
        return currentRoles;
    };
  
    /**
     * 获取当前用户角色ID
     * @returns {Array<number>}
     */
    const getCurrentRoleIds = () => {
        return currentRoleIds;
    };
    
    return {
        hasPermission,
        hasRole,
        getCurrentRoles,
        getCurrentRoleIds
    };
}