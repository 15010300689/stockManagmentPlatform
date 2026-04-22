import React from 'react';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input, Button, Space } from 'antd';

interface QueryFormProps {
    onSearch?: (roleName: string) => void;
    onAddRole?: () => void;
}

function QueryForm(props: QueryFormProps): JSX.Element {
    const [form] = Form.useForm<{ roleName?: string }>();

    const handleSearch = () => {
        const value = form.getFieldValue('roleName') || '';
        props.onSearch?.(value);
    };

    const handleReset = () => {
        form.resetFields();
        props.onSearch?.('');
    };

    return (
        <Form form={form} layout="inline">
            <Form.Item label="角色名称" name="roleName">
                <Input
                    allowClear
                    placeholder="请输入角色名称"
                    onPressEnter={handleSearch}
                />
            </Form.Item>
            <Form.Item>
                <Space>
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleSearch}
                    >
                        搜索
                    </Button>
                    <Button onClick={handleReset}>
                        重置
                    </Button>
                    <Button
                        icon={<PlusOutlined />}
                        color="primary"
                        variant="outlined"
                        onClick={props.onAddRole}
                    >
                        添加角色
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}

export default QueryForm;
