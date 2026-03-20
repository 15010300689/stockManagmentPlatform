import React from 'react';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input, Button, Select, Space } from 'antd';

interface QueryValues {
    keyword?: string;
    status?: string;
}

interface QueryFormProps {
    onSearch?: (values: QueryValues) => void;
    onAddStore?: () => void;
}

function QueryForm(props: QueryFormProps): JSX.Element {
    const [form] = Form.useForm<QueryValues>();

    const handleSearch = () => {
        const values = form.getFieldsValue();
        props.onSearch?.(values);
    };

    return (
        <Form form={form} layout="inline">
            <Form.Item label="编码/名称" name="keyword">
                <Input
                    allowClear
                    placeholder="请输入仓库编码或名称"
                    style={{ width: 200 }}
                    onPressEnter={handleSearch}
                />
            </Form.Item>
            <Form.Item label="状态" name="status">
                <Select
                    placeholder="请选择状态"
                    allowClear
                    style={{ width: 120 }}
                    options={[
                        { label: '启用', value: '1' },
                        { label: '停用', value: '0' }
                    ]}
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
                    <Button
                        icon={<PlusOutlined />}
                        onClick={props.onAddStore}
                    >
                        新增仓库
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}

export default QueryForm;
