import React from 'react';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input, Button, Space } from 'antd';

interface QueryFormProps {
    onSearch?: (value: string) => void;
    onAddUser?: () => void;
}

function QueryForm(props: QueryFormProps): JSX.Element {
    const [form] = Form.useForm<{ userName?: string }>();

    const handleSearch = () => {
        const value = form.getFieldValue('userName') || '';
        props.onSearch?.(value);
    };

    const handleReset = () => {
        form.resetFields();
        props.onSearch?.('');
    };

    return (
        <Form form={form} layout="inline">
            <Form.Item label="" name="userName">
                <Input
                    allowClear
                    placeholder="请输入用户名称"
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
                        onClick={props.onAddUser}
                    >
                        添加用户
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}

export default QueryForm;
