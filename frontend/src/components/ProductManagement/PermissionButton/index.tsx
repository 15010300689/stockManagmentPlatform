import React from 'react';
import { Button, Space } from 'antd';
import type { ButtonProps } from 'antd';
import { hasPermission } from '../../../auth';

interface PermissionButtonProps extends ButtonProps {
    permission: string;
    roles?: number[];
    children?: React.ReactNode;
}

interface GroupButtonItem {
    permission: string;
    roles?: number[];
    buttonProps?: ButtonProps;
    children?: React.ReactNode;
}

interface PermissionGroupProps {
    buttons: GroupButtonItem[];
}

const PermissionButton = ({ permission, children, ...rest }: PermissionButtonProps) => {
    if (!hasPermission(permission)) return null;
    return <Button {...rest}>{children}</Button>;
};

PermissionButton.Group = ({ buttons }: PermissionGroupProps) => {
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
