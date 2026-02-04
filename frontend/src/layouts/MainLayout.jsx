import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUsername, clearAuth, authFetch } from '../auth';
import { Button, Space, message } from 'antd';

import { menuItems } from '../config/menu';

const { Header, Sider, Content } = Layout;

const API_BASE = '/api';


function MainLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    // const menuItems = [
    //     { key: '/product', label: '📦 商品管理' },
    //     { key: '/account', label: '👤 账号管理' },
    //     { key: '/permission', label: '🔒 权限管理',},
    //     { key: '/role', label: '👥 角色管理' },
    //     { key: '/user', label: '👨‍👩‍👧‍👦 用户管理' },
    // ];

    const handleMenuClick = (item) => {
        const { key, children } = item;
        if (children) {
            return;
        }

        navigate(key);
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
        <Layout style={{ height: '100vh',overflow: 'hidden' }}>
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
                    <span>欢迎, {getUsername() || '贺燕珍'}</span>
                    <Button type="text" style={{ color: '#fff' }} onClick={handleLogout}>
                        退出
                    </Button>
                </Space>
            </Header>
            <Layout>
                <Sider width={200} style={{ background: '#fff', maxHeight: '100%',overflowY: 'hidden' }}>
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        style={{ height: '100%', borderRight: 0,overflowY: 'auto' }}
                        onClick={handleMenuClick}
                        items={menuItems}
                    >
                    </Menu>
                </Sider>
                <Layout style={{ overflow: 'hidden',minHeight: '100vh',display: 'flex', paddingBottom: '58px' }}>
                    <Content style={{ background: '#f0f2f5', padding: '24px', minHeight: 200, flex: 1, overflowY: 'auto' }}>
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}

export default MainLayout;
