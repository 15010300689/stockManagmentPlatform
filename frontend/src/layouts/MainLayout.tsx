import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Menu, Button, Space, Tag, message, Spin, Empty } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getUsername, clearAuth, setPermissionCodes, setMenuPaths, extractMenuPaths } from '../auth';
import { requestWithAuth } from '../api/client';
import { isMockEnabled } from '../mock/apiMock';

const { Header, Sider, Content } = Layout;
const API_BASE = '/api';
const MENU_OPEN_KEYS_STORAGE = 'layout_menu_open_keys';

type MenuNode = {
    key?: React.Key;
    children?: MenuNode[];
};

function MainLayout(): JSX.Element {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuItems, setMenuItems] = useState<MenuProps['items']>([]);
    const [menuLoading, setMenuLoading] = useState(false);
    const [openKeys, setOpenKeys] = useState<string[]>(() => {
        try {
            const raw = localStorage.getItem(MENU_OPEN_KEYS_STORAGE);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
        } catch {
            return [];
        }
    });
    const mockEnabled = isMockEnabled();

    const loadMenus = async () => {
        setMenuLoading(true);
        try {
            const res = await requestWithAuth(`${API_BASE}/auth/menus`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setMenuItems(data);
                setMenuPaths(extractMenuPaths(data));
            } else {
                setMenuItems([]);
                setMenuPaths([]);
            }

            // 同步刷新当前用户权限码，角色权限改动后无需重新登录即可生效
            const pRes = await requestWithAuth(`${API_BASE}/auth/permissions`);
            const pData = await pRes.json();
            if (Array.isArray(pData)) {
                setPermissionCodes(pData);
            }
        } catch (e) {
            setMenuItems([]);
            setMenuPaths([]);
            console.error('加载动态菜单失败', e);
        } finally {
            setMenuLoading(false);
        }
    };

    useEffect(() => {
        loadMenus();
    }, []);

    const parentKeyMap = useMemo(() => {
        const map = new Map<string, string>();
        const walk = (items: MenuProps['items'], parentKey?: string) => {
            (items || []).forEach((item) => {
                if (!item || typeof item !== 'object' || !('key' in item)) return;
                const node = item as unknown as MenuNode;
                const key = typeof node.key === 'string' ? node.key : String(node.key ?? '');
                if (!key) return;
                if (parentKey) map.set(key, parentKey);
                if (Array.isArray(node.children) && node.children.length > 0) {
                    walk(node.children as MenuProps['items'], key);
                }
            });
        };
        walk(menuItems);
        return map;
    }, [menuItems]);

    useEffect(() => {
        const nextAncestors: string[] = [];
        let current = parentKeyMap.get(location.pathname);
        while (current) {
            nextAncestors.unshift(current);
            current = parentKeyMap.get(current);
        }
        if (nextAncestors.length === 0) return;
        setOpenKeys((prev) => {
            const merged = Array.from(new Set([...prev, ...nextAncestors]));
            try {
                localStorage.setItem(MENU_OPEN_KEYS_STORAGE, JSON.stringify(merged));
            } catch {
                // ignore storage write errors
            }
            return merged;
        });
    }, [location.pathname, parentKeyMap]);

    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (typeof key === 'string' && key.startsWith('/')) {
            navigate(key);
        }
    };

    const handleOpenChange: MenuProps['onOpenChange'] = (keys) => {
        const nextKeys = keys.map((key) => String(key));
        setOpenKeys(nextKeys);
        try {
            localStorage.setItem(MENU_OPEN_KEYS_STORAGE, JSON.stringify(nextKeys));
        } catch {
            // ignore storage write errors
        }
    };

    const handleLogout = async () => {
        try {
            await requestWithAuth(`${API_BASE}/logout`, { method: 'POST' });
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
                    ) : !menuItems || menuItems.length === 0 ? (
                        <div style={{ padding: 24 }}>
                            <Empty description="暂无可访问菜单" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </div>
                    ) : (
                        <Menu
                            mode="inline"
                            selectedKeys={[location.pathname]}
                            openKeys={openKeys}
                            style={{ height: '100%', borderRight: 0, overflowY: 'auto' }}
                            onClick={handleMenuClick}
                            onOpenChange={handleOpenChange}
                            items={menuItems}
                        />
                    )}
                </Sider>
                <Layout style={{ overflow: 'hidden', minHeight: '100vh', display: 'flex', paddingBottom: '58px' }}>
                    <Content style={{ background: '#f0f2f5', padding: '24px', minHeight: 200, flex: 1, overflowY: 'auto' }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}

export default MainLayout;
