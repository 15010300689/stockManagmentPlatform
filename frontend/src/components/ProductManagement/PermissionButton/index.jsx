import React from 'react';
import { Button, Space } from 'antd';
import { getRoles, getRoleIds } from '../../auth';
import { roleList } from '../../mock/roleList';
import { permissionMap } from '../../config/permissionConfig';

/**
 * 权限控制按钮组件
 * @param {Object} props
 * @param {string} props.permission - 权限标识（add/edit/delete/view/import/export/approve等）
 * @param {Array<number>} [props.roles] - 允许的角色ID列表（可选，默认使用权限映射表）
 * @param {*} props.children - 按钮内容
 * @param {*} props.rest - 其他Button属性
 */
const PermissionButton = ({ permission, roles, children, ...rest }) => {
    const currentRoleIds = getRoleIds();
  
    // 检查权限
    const hasPermission = () => {
        // 如果没有登录，没有权限
        if (currentRoleIds.length === 0) return false;
        
        // 如果指定了角色列表，检查当前角色是否在列表中
        if (roles && roles.length > 0) {
            return currentRoleIds.some(roleId => roles.includes(roleId));
        }
        
        // 否则使用权限映射表，只要有一个角色有此权限就返回true
        return currentRoleIds.some(roleId => permissionMap[roleId]?.[permission] || false);
    };
  
    // 如果没有权限，不渲染按钮
    if (!hasPermission()) return null;
    
    // 渲染按钮
    return <Button {...rest}>{children}</Button>;
};

/**
 * 权限控制空间组件
 * @param {Object} props
 * @param {Array<{permission: string, roles?: Array<number>, buttonProps: Object, children: ReactNode}>} props.buttons - 按钮配置列表
 */
PermissionButton.Group = ({ buttons }) => {
    return (
        <Space>
            {buttons.map((button, index) => (
                <PermissionButton 
                key={index}
                permission={button.permission}
                roles={button.roles}
                {...button.buttonProps}
                >
                    {button.children}
                </PermissionButton>
            ))}
        </Space>
    );
};

export default PermissionButton;