import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useHistory } from 'react-router-dom';
import { saveAuth } from '../auth';

const API_BASE = '/api';

function Login() {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const history = useHistory();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: values.username,
                    password: values.password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                saveAuth(data.token, data.username);
                message.success('登录成功');
                const { from } = history.location.state || { from: { pathname: '/' } };
                history.push(from);
            } else {
                message.error(data.message || '登录失败，请检查用户名和密码');
            }
        } catch (error) {
            console.error('登录错误:', error);
            message.error('登录失败: ' + error.message);
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
