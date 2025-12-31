import React from 'react';
import { Layout, Menu } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { getUsername, clearAuth, authFetch } from '../auth';
import { Button, Space, message } from 'antd';

const { Header, Sider, Content } = Layout;

const API_BASE = '/api';

function MainLayout({ children }) {
    const history = useHistory();
    const location = useLocation();

    const menuItems = [
        { key: '/product', label: '📦 商品管理' },
        { key: '/account', label: '👤 账号管理' },
        { key: '/permission', label: '🔒 权限管理' },
        { key: '/role', label: '👥 角色管理' },
        { key: '/user', label: '👨‍👩‍👧‍👦 用户管理' },
    ];

    const handleMenuClick = ({ key }) => {
        history.push(key);
    };

    const handleLogout = async () => {
        try {
            await authFetch(`${API_BASE}/logout`, { method: 'POST' });
        } catch (error) {
            console.error('登出失败:', error);
        } finally {
            clearAuth();
            message.success('已退出登录');
            history.push('/login');
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <h1 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>
                    📦 库存管理系统
                </h1>
                <Space style={{ color: '#fff' }}>
                    <span>欢迎, {getUsername()}</span>
                    <Button type="text" style={{ color: '#fff' }} onClick={handleLogout}>
                        退出
                    </Button>
                </Space>
            </Header>
            <Layout>
                <Sider width={200} style={{ background: '#fff' }}>
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        style={{ height: '100%', borderRight: 0 }}
                        onClick={handleMenuClick}
                    >
                        {menuItems.map(item => (
                            <Menu.Item key={item.key}>
                                {item.label}
                            </Menu.Item>
                        ))}
                    </Menu>
                </Sider>
                <Layout style={{ padding: '24px' }}>
                    <Content style={{ background: '#f0f2f5', padding: '24px', minHeight: 280 }}>
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}

export default MainLayout;
