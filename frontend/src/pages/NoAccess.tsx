import React from 'react';
import { Result, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { clearAuth, getMenuPaths, getUsername } from '../auth';

function NoAccess(): JSX.Element {
    const navigate = useNavigate();
    const menuPaths = getMenuPaths();
    const username = getUsername();
    const firstAvailablePath = menuPaths[0];

    const handleRelogin = () => {
        clearAuth();
        navigate('/login', { replace: true });
    };

    const handleRefreshPermissions = () => {
        window.location.reload();
    };

    return (
        <Result
            status="403"
            title="无访问权限"
            subTitle={(
                <div>
                    <div>当前账号{username ? `「${username}」` : ''}没有该页面访问权限。</div>
                    <div>请联系系统管理员分配角色菜单或接口权限后重试。</div>
                </div>
            )}
            extra={
                <Space>
                    {firstAvailablePath && (
                        <Button type="primary" onClick={() => navigate(firstAvailablePath, { replace: true })}>
                            返回可访问页面
                        </Button>
                    )}
                    <Button onClick={handleRefreshPermissions}>
                        重新加载权限
                    </Button>
                    <Button onClick={handleRelogin}>
                        退出并重新登录
                    </Button>
                </Space>
            }
        />
    );
}

export default NoAccess;
