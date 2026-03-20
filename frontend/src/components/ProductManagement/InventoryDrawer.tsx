import React, { useMemo } from 'react';
import type { ProductItem, StoreItem, PositionItem } from '../../types/inventory';
import {
    Drawer,
    Tabs,
    Table,
    Tag,
    Form,
    InputNumber,
    Select,
    Input,
    TreeSelect,
    Space,
    Button,
    message,
    Empty,
    Typography,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    HomeOutlined,
    AppstoreOutlined,
    BarsOutlined,
    ContainerOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface InventoryDrawerProps {
    visible?: boolean;
    onClose?: () => void;
    product?: ProductItem | null;
    warehouseList?: StoreItem[];
    positionList?: PositionItem[];
    onAdjust?: (values: unknown) => void;
}

function InventoryDrawer({
    visible = false,
    onClose = () => {},
    product = null,
    warehouseList = [],
    positionList = [],
    onAdjust = () => {}
}: InventoryDrawerProps): JSX.Element {
    const [form] = Form.useForm();

    // 构建树形仓位数据
    const buildTree = (data, warehouseId, parentId = null) => {
        return data
            .filter(
                (item) =>
                    item.warehouseId === warehouseId &&
                    ((item.parentId === null && parentId === null) ||
                        (item.parentId !== null &&
                            parentId !== null &&
                            String(item.parentId) === String(parentId)))
            )
            .map((item) => {
                const children = buildTree(data, warehouseId, item.id);
                return {
                    id: item.id,
                    title: `${item.code}${item.name ? ' - ' + item.name : ''}`,
                    value: item.id,
                    children: children.length > 0 ? children : undefined,
                };
            });
    };

    const warehouseOptions = warehouseList.map((item) => ({
        label: item.name,
        value: item.id,
        disabled: item.status !== '1',
    }));

    // 汇总数据（示例用简单分摊）
    const summaryData = useMemo(() => {
        const totalQuantity = product?.quantity || 0;
        const base = Math.max(totalQuantity, 0);
        const len = warehouseList.length || 1;
        return warehouseList.map((w, idx) => {
            const available = Math.max(0, Math.round((base * (len - idx)) / len));
            const reserved = Math.round(available * 0.1);
            return {
                warehouseId: w.id,
                warehouseName: w.name,
                status: w.status,
                available,
                reserved,
                total: available + reserved,
            };
        });
    }, [warehouseList, product]);

    // 仓位明细树
    const positionTree = useMemo(() => {
        return warehouseList.map((w) => ({
            key: w.id,
            warehouseId: w.id,
            title: w.name,
            children: buildTree(positionList, w.id),
        }));
    }, [warehouseList, positionList]);

    const summaryColumns = [
        {
            title: '仓库',
            dataIndex: 'warehouseName',
            key: 'warehouseName',
            render: (text, record) => (
                <Space>
                    <Text>{text}</Text>
                    <Tag color={record.status === '1' ? 'green' : 'red'}>
                        {record.status === '1' ? '启用' : '停用'}
                    </Tag>
                </Space>
            ),
        },
        {
            title: '可用库存',
            dataIndex: 'available',
            key: 'available',
        },
        {
            title: '占用',
            dataIndex: 'reserved',
            key: 'reserved',
        },
        {
            title: '合计',
            dataIndex: 'total',
            key: 'total',
        },
    ];

    const logsColumns = [
        { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
        { title: '类型', dataIndex: 'type', key: 'type', width: 80 },
        { title: '数量', dataIndex: 'amount', key: 'amount', width: 80 },
        { title: '仓库', dataIndex: 'warehouseName', key: 'warehouseName' },
        { title: '仓位', dataIndex: 'positionName', key: 'positionName' },
        { title: '备注', dataIndex: 'remark', key: 'remark' },
    ];

    const mockLogs = useMemo(() => {
        if (!product) return [];
        return [
            {
                key: 1,
                time: '2026-02-05 10:20',
                type: '入库',
                amount: '+20',
                warehouseName: '主仓库',
                positionName: 'A-01-1-01',
                remark: '补货',
            },
            {
                key: 2,
                time: '2026-02-04 16:05',
                type: '出库',
                amount: '-5',
                warehouseName: '主仓库',
                positionName: 'A-01-1-02',
                remark: '发货',
            },
        ];
    }, [product]);

    const handleAdjust = async (values) => {
        onAdjust(values);
        message.success('已模拟调整库存');
        form.resetFields();
    };

    return (
        <Drawer
            title={product ? `库存 - ${product.name}` : '库存'}
            size="large"
            open={visible}
            onClose={onClose}
            destroyOnHidden={true}
        >
            {product ? (
                <Tabs
                    items={[
                        {
                            key: 'summary',
                            label: '分仓库存',
                            children: (
                                <div>
                                    <Row gutter={16} style={{ marginBottom: 12 }}>
                                        <Col span={6}>
                                            <Statistic
                                                title="总库存"
                                                value={product.quantity}
                                                prefix={<ContainerOutlined />}
                                            />
                                        </Col>
                                        <Col span={6}>
                                            <Statistic
                                                title="仓库数"
                                                value={warehouseList.length}
                                                prefix={<HomeOutlined />}
                                            />
                                        </Col>
                                        <Col span={6}>
                                            <Statistic
                                                title="仓位数"
                                                value={positionList.length}
                                                prefix={<AppstoreOutlined />}
                                            />
                                        </Col>
                                    </Row>
                                    <Table
                                        size="small"
                                        rowKey="warehouseId"
                                        dataSource={summaryData}
                                        columns={summaryColumns}
                                        pagination={false}
                                    />
                                </div>
                            ),
                        },
                        {
                            key: 'adjust',
                            label: '库存调整',
                            children: (
                                <Form
                                    form={form}
                                    layout="vertical"
                                    initialValues={{ type: 'in' }}
                                    onFinish={handleAdjust}
                                >
                                    <Form.Item
                                        label="仓库"
                                        name="warehouseId"
                                        rules={[{ required: true, message: '请选择仓库' }]}
                                    >
                                        <Select
                                            placeholder="请选择仓库"
                                            options={warehouseOptions}
                                            onChange={() => form.setFieldValue('positionId', undefined)}
                                        />
                                    </Form.Item>
                                    <Form.Item label="仓位" name="positionId">
                                        <TreeSelect
                                            placeholder="可选，精确到仓位"
                                            treeData={buildTree(
                                                positionList,
                                                form.getFieldValue('warehouseId')
                                            )}
                                            disabled={!form.getFieldValue('warehouseId')}
                                            allowClear
                                            treeDefaultExpandAll
                                            fieldNames={{
                                                label: 'title',
                                                value: 'id',
                                                children: 'children',
                                            }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="数量"
                                        name="amount"
                                        rules={[{ required: true, message: '请输入数量' }]}
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            min={1}
                                            placeholder="请输入数量"
                                        />
                                    </Form.Item>
                                    <Form.Item label="类型" name="type">
                                        <Select
                                            options={[
                                                { label: '入库', value: 'in' },
                                                { label: '出库', value: 'out' },
                                            ]}
                                        />
                                    </Form.Item>
                                    <Form.Item label="备注" name="remark">
                                        <Input.TextArea rows={3} placeholder="可填写原因、批次等信息" />
                                    </Form.Item>
                                    <Form.Item>
                                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                                            <Button onClick={() => form.resetFields()}>重置</Button>
                                            <Button type="primary" htmlType="submit">
                                                提交
                                            </Button>
                                        </Space>
                                    </Form.Item>
                                </Form>
                            ),
                        },
                        {
                            key: 'logs',
                            label: '库存流水',
                            children: mockLogs.length ? (
                                <Table
                                    size="small"
                                    rowKey="key"
                                    dataSource={mockLogs}
                                    columns={logsColumns}
                                    pagination={false}
                                />
                            ) : (
                                <Empty description="暂无流水" />
                            ),
                        },
                        {
                            key: 'positions',
                            label: '仓位树',
                            children: positionTree.length ? (
                                <Table
                                    size="small"
                                    pagination={false}
                                    rowKey="key"
                                    dataSource={positionTree}
                                    columns={[
                                        { title: '仓库', dataIndex: 'title', key: 'title' },
                                        {
                                            title: '仓位',
                                            key: 'positions',
                                            render: (_, record) => (
                                                record.children && record.children.length > 0 ? (
                                                    <Space orientation="vertical">
                                                        {record.children.map((child) => (
                                                            <Text key={child.id}>{child.title}</Text>
                                                        ))}
                                                    </Space>
                                                ) : (
                                                    <Text type="secondary">暂无仓位</Text>
                                                )
                                            ),
                                        },
                                    ]}
                                />
                            ) : (
                                <Empty description="暂无仓位数据" />
                            ),
                        },
                    ]}
                />
            ) : (
                <Empty description="请选择商品查看库存" />
            )}
        </Drawer>
    );
}

export default InventoryDrawer;
