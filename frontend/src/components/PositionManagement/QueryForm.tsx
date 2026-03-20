import React from 'react';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input, Button, Select, Space } from 'antd';
import type { StoreItem } from '../../types/inventory';

interface QueryValues {
    warehouseId?: string;
    code?: string;
    type?: string;
    status?: string;
}

interface QueryFormProps {
    warehouseList?: StoreItem[];
    onSearch?: (values: QueryValues) => void;
    onAddPosition?: () => void;
}

function QueryForm(props: QueryFormProps): JSX.Element {
    const [form] = Form.useForm<QueryValues>();
    const { warehouseList = [] } = props;

    const handleSearch = () => {
        const values = form.getFieldsValue();
        props.onSearch?.(values);
    };

    return (
        <Form form={form} layout="inline">
            <Form.Item label="仓库" name="warehouseId">
                <Select
                    placeholder="请选择仓库"
                    allowClear
                    style={{ width: 150 }}
                    options={warehouseList.map(item => ({
                        label: item.name,
                        value: String(item.id)
                    }))}
                />
            </Form.Item>
            <Form.Item label="仓位编码" name="code">
                <Input
                    allowClear
                    placeholder="请输入仓位编码"
                    style={{ width: 150 }}
                    onPressEnter={handleSearch}
                />
            </Form.Item>
            <Form.Item label="类型" name="type">
                <Select
                    placeholder="请选择类型"
                    allowClear
                    style={{ width: 120 }}
                    options={[
                        { label: '库区', value: 'area' },
                        { label: '货架', value: 'shelf' },
                        { label: '层', value: 'level' },
                        { label: '仓位', value: 'position' }
                    ]}
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
                        onClick={props.onAddPosition}
                    >
                        新增仓位
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}

export default QueryForm;
