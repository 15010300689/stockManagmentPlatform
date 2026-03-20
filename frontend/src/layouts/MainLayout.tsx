import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, Tag, message, Spin } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUsername, clearAuth, authFetch, setPermissionCodes } from '../auth';
import { menuItems as fallbackMenuItems } from '../config/menu';
import { isMockEnabled } from '../mock/apiMock';

const { Header, Sider, Content } = Layout;
const API_BASE = '/api';

interface MainLayoutProps {
    children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps): JSX.Element {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuItems, setMenuItems] = useState<MenuProps['items']>(fallbackMenuItems as MenuProps['items']);
    const [menuLoading, setMenuLoading] = useState(false);
    const mockEnabled = isMockEnabled();

    const loadMenus = async () => {
        setMenuLoading(true);
        try {
            const res = await authFetch(`${API_BASE}/auth/menus`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setMenuItems(data);
            }

            // 同步刷新当前用户权限码，角色权限改动后无需重新登录即可生效
            const pRes = await authFetch(`${API_BASE}/auth/permissions`);
            const pData = await pRes.json();
            if (Array.isArray(pData)) {
                setPermissionCodes(pData);
            }
        } catch (e) {
            console.error('加载动态菜单失败，使用本地兜底菜单', e);
        } finally {
            setMenuLoading(false);
        }
    };

    useEffect(() => {
        loadMenus();
    }, []);

    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (typeof key === 'string' && key.startsWith('/')) {
            navigate(key);
        }
    };

    const handleLogout = async () => {
        try {
            await authFetch(`${API_BASE}/logout`, { method: 'POST' });
        } catch (error) {
            console.error('登出失败:', error);
        } finally {
            clearAuth();
            message.success('已退出登录');
            navigate('/login');
        }
    };

    return (
        <Layout style={{ height: '100vh', overflow: 'hidden' }}>
            <Header style={{
                background: '#13c2c2',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <h1 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>
                    📦 库存管理系统
                </h1>
                <Space style={{ color: '#fff' }}>
                    {mockEnabled && (
                        <Tag color="gold" style={{ marginRight: 0 }}>
                            MOCK 模式
                        </Tag>
                    )}
                    <span>欢迎, {getUsername() || '用户'}</span>
                    <Button type="text" style={{ color: '#fff' }} onClick={handleLogout}>
                        退出
                    </Button>
                </Space>
            </Header>
            <Layout>
                <Sider width={220} style={{ background: '#fff', maxHeight: '100%', overflowY: 'hidden' }}>
                    {menuLoading ? (
                        <div style={{ padding: 24, textAlign: 'center' }}><Spin /></div>
                    ) : (
                        <Menu
                            mode="inline"
                            selectedKeys={[location.pathname]}
                            style={{ height: '100%', borderRight: 0, overflowY: 'auto' }}
                            onClick={handleMenuClick}
                            items={menuItems}
                        />
                    )}
                </Sider>
                <Layout style={{ overflow: 'hidden', minHeight: '100vh', display: 'flex', paddingBottom: '58px' }}>
                    <Content style={{ background: '#f0f2f5', padding: '24px', minHeight: 200, flex: 1, overflowY: 'auto' }}>
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}

export default MainLayout;
