import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import type { FormInstance } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch, saveAuth } from '../auth';
import { notifyErrorOnce } from '../http';

const API_BASE = '/api';

interface LoginForm {
    username: string;
    password: string;
}

interface LoginResponse {
    success: boolean;
    token?: string;
    username?: string;
    roleList?: Array<{ id: number; roleName: string }>;
    permissionCodes?: string[];
    message?: string;
}

function Login(): JSX.Element {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm<LoginForm>() as [FormInstance<LoginForm>];
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const getRedirectPath = (): string => {
        const redirect = searchParams.get('redirect');
        if (!redirect) return '/product';
        const decoded = decodeURIComponent(redirect);
        if (decoded.startsWith('/') && !decoded.startsWith('//')) {
            return decoded;
        }
        return '/product';
    };

    const handleSubmit = async (values: LoginForm) => {
        setLoading(true);
        try {
            const response = await apiFetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: values.username,
                    password: values.password
                })
            });

            const data: LoginResponse = await response.json();

            if (response.ok && data.success && data.token && data.username) {
                saveAuth(
                    data.token,
                    data.username,
                    data.roleList || [],
                    data.permissionCodes || []
                );
                message.success('登录成功');
                navigate(getRedirectPath(), { replace: true });
            } else {
                notifyErrorOnce(data.message || '登录失败，请检查用户名和密码', {
                    dedupKey: 'login-failed'
                });
            }
        } catch (error) {
            console.error('登录错误:', error);
            notifyErrorOnce(error, {
                fallback: '登录失败，请稍后重试',
                dedupKey: 'login-exception'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#13c2c2'
        }}>
            <Card
                title={
                    <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                        📦 库存管理系统
                    </div>
                }
                style={{ width: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    size="large"
                >
                    <Form.Item
                        label="用户名"
                        name="username"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input placeholder="请输入用户名" />
                    </Form.Item>
                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password placeholder="请输入密码" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
                <div style={{ marginTop: 16, fontSize: '12px', color: '#999', textAlign: 'center' }}>
                    <p>默认账号: admin / admin123</p>
                    <p>或: user / user123</p>
                </div>
            </Card>
        </div>
    );
}

export default Login;
