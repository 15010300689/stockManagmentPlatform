import React, { useEffect, useMemo, useState } from 'react';
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
    Statistic,
    Alert,
    Progress
} from 'antd';
import {
    HomeOutlined,
    AppstoreOutlined,
    BarsOutlined,
    ContainerOutlined
} from '@ant-design/icons';
import { requestWithAuth } from '../../api/client';
import { buildPositionTree } from '../../utils/positionTree';
import type { PositionInventoryOverview } from '../../types/inventoryOverview';

const { Text } = Typography;

interface InventoryDrawerProps {
    visible?: boolean;
    onClose?: () => void;
    product?: ProductItem | null;
    warehouseList?: StoreItem[];
    positionList?: PositionItem[];
    onAdjust?: () => void;
    onProductUpdated?: () => void;
}

interface LogRow {
    id: number;
    createTime?: string;
    typeLabel?: string;
    amount?: number;
    warehouseName?: string;
    positionName?: string;
    remark?: string;
}

interface SummaryRow {
    warehouseId: number;
    warehouseName: string;
    status: string;
    available: number;
    reserved: number;
    total: number;
}

interface PositionRow {
    warehouseId: number;
    warehouseName: string;
    positionId?: number;
    positionName?: string;
    code?: string;
    quantity: number;
}

interface AdjustFormValues {
    warehouseId: number;
    positionId?: number;
    amount: number;
    type: 'in' | 'out';
    remark?: string;
}

interface CapacityInfo {
    usedQuantity: number;
    maxCapacity: number;
    remainingQuantity?: number | null;
    utilizationPercent?: number | null;
    unit?: string;
}

const API_BASE = '/api';

function InventoryDrawer({
    visible = false,
    onClose = () => {},
    product = null,
    warehouseList = [],
    positionList = [],
    onAdjust = () => {},
    onProductUpdated = () => {},
}: InventoryDrawerProps): JSX.Element {
    const [form] = Form.useForm();
    const [summaryRows, setSummaryRows] = useState<SummaryRow[]>([]);
    const [positionRows, setPositionRows] = useState<PositionRow[]>([]);
    const [logRows, setLogRows] = useState<LogRow[]>([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>();
    const [capacityInfo, setCapacityInfo] = useState<CapacityInfo | null>(null);

    const adjustType = Form.useWatch('type', form);
    const adjustWarehouseId = Form.useWatch('warehouseId', form);
    const adjustPositionId = Form.useWatch('positionId', form);

    const warehouseOptions = warehouseList.map((item) => ({
        label: item.name,
        value: item.id,
        disabled: item.status !== '1',
    }));

    // 仓位明细树（展示用）
    const positionTree = useMemo(() => {
        return warehouseList.map((w) => ({
            key: w.id,
            warehouseId: w.id,
            title: w.name,
            children: buildPositionTree(positionList, w.id),
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

    const loadInventoryData = async () => {
        if (!visible || !product?.id) return;
        setInventoryLoading(true);
        try {
            const pid = encodeURIComponent(String(product.id));
            const [summaryRes, positionsRes, logsRes] = await Promise.all([
                requestWithAuth(`${API_BASE}/inventory/summary?productId=${pid}`),
                requestWithAuth(`${API_BASE}/inventory/positions?productId=${pid}`),
                requestWithAuth(`${API_BASE}/inventory/logs?productId=${pid}`),
            ]);

            if (summaryRes.ok) {
                const summaryPayload = await summaryRes.json();
                setSummaryRows(
                    Array.isArray(summaryPayload) ? (summaryPayload as SummaryRow[]) : []
                );
            } else {
                setSummaryRows([]);
            }

            if (positionsRes.ok) {
                const positionsPayload = await positionsRes.json();
                setPositionRows(Array.isArray(positionsPayload) ? (positionsPayload as PositionRow[]) : []);
            } else {
                setPositionRows([]);
            }

            if (logsRes.ok) {
                const logsPayload = await logsRes.json();
                setLogRows(Array.isArray(logsPayload) ? (logsPayload as LogRow[]) : []);
            } else {
                setLogRows([]);
            }
        } catch (error) {
            console.warn('加载库存数据失败', error);
            message.error('加载库存数据失败: ' + (error as Error).message);
            setSummaryRows([]);
            setPositionRows([]);
            setLogRows([]);
        } finally {
            setInventoryLoading(false);
        }
    };

    useEffect(() => {
        void loadInventoryData();
    }, [visible, product?.id]);

    useEffect(() => {
        const loadCapacityInfo = async () => {
            if (!visible || adjustType !== 'in' || !adjustPositionId) {
                setCapacityInfo(null);
                return;
            }
            try {
                const response = await requestWithAuth(
                    `${API_BASE}/positions/${encodeURIComponent(String(adjustPositionId))}/inventory/overview`
                );
                if (!response.ok) {
                    setCapacityInfo(null);
                    return;
                }
                const data = (await response.json()) as PositionInventoryOverview;
                setCapacityInfo({
                    usedQuantity: Number(data.usedQuantity ?? 0),
                    maxCapacity: Number(data.maxCapacity ?? 0),
                    remainingQuantity: data.remainingQuantity,
                    utilizationPercent: data.utilizationPercent,
                    unit: data.unit || '件',
                });
            } catch {
                setCapacityInfo(null);
            }
        };
        void loadCapacityInfo();
    }, [visible, adjustType, adjustPositionId]);

    const currentLocationStock = useMemo(() => {
        if (adjustType !== 'out' || !adjustWarehouseId) {
            return null;
        }
        if (adjustPositionId != null) {
            const row = positionRows.find((item) => Number(item.positionId) === Number(adjustPositionId));
            return row?.quantity ?? 0;
        }
        const warehouseTotal = summaryRows.find((item) => Number(item.warehouseId) === Number(adjustWarehouseId));
        return warehouseTotal?.total ?? 0;
    }, [adjustType, adjustWarehouseId, adjustPositionId, positionRows, summaryRows]);

    const maxAdjustIn =
        adjustType === 'in' &&
        capacityInfo?.maxCapacity &&
        capacityInfo.maxCapacity > 0 &&
        capacityInfo.remainingQuantity != null
            ? Math.max(Number(capacityInfo.remainingQuantity), 0)
            : undefined;

    const handleAdjust = async (values: AdjustFormValues) => {
        if (!product?.id) return;
        try {
            const response = await requestWithAuth(`${API_BASE}/inventory/adjust`, {
                method: 'POST',
                body: JSON.stringify({
                    productId: Number(product.id),
                    warehouseId: values.warehouseId,
                    positionId: values.positionId ?? null,
                    amount: values.amount,
                    type: values.type,
                    remark: values.remark || ''
                })
            });
            const result = await response.json();
            if (!response.ok || result?.success === false) {
                message.error(result?.message || '库存调整失败');
                return;
            }
            message.success(result?.message || '库存调整成功');
            form.resetFields();
            await loadInventoryData();
            onAdjust();
            onProductUpdated();
        } catch (error) {
            message.error('库存调整失败: ' + (error as Error).message);
        }
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
                                        loading={inventoryLoading}
                                        dataSource={summaryRows}
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
                                            onChange={(v) => {
                                                setSelectedWarehouseId(v);
                                                form.setFieldValue('positionId', undefined);
                                                setCapacityInfo(null);
                                            }}
                                        />
                                    </Form.Item>
                                    <Form.Item label="仓位" name="positionId">
                                        <TreeSelect
                                            placeholder="可选，精确到仓位"
                                            treeData={buildPositionTree(
                                                positionList,
                                                selectedWarehouseId ?? form.getFieldValue('warehouseId')
                                            )}
                                            disabled={!(selectedWarehouseId ?? form.getFieldValue('warehouseId'))}
                                            allowClear
                                            treeDefaultExpandAll
                                            fieldNames={{
                                                label: 'title',
                                                value: 'id',
                                                children: 'children',
                                            }}
                                        />
                                    </Form.Item>
                                    {adjustType === 'out' && currentLocationStock != null && (
                                        <Alert
                                            type={currentLocationStock > 0 ? 'info' : 'warning'}
                                            showIcon
                                            style={{ marginBottom: 16 }}
                                            message={`当前可出库存：${currentLocationStock}`}
                                            description={adjustPositionId ? '按当前选择仓位统计。' : '未选择仓位时按当前仓库总库存统计。'}
                                        />
                                    )}
                                    {adjustType === 'in' && capacityInfo?.maxCapacity ? (
                                        <Alert
                                            type={(capacityInfo.utilizationPercent ?? 0) >= 90 ? 'warning' : 'info'}
                                            showIcon
                                            style={{ marginBottom: 16 }}
                                            message={`仓位容量：已占 ${capacityInfo.usedQuantity}/${capacityInfo.maxCapacity} ${capacityInfo.unit || '件'}，剩余 ${capacityInfo.remainingQuantity ?? 0}`}
                                            description={
                                                <Progress
                                                    percent={capacityInfo.utilizationPercent ?? 0}
                                                    size="small"
                                                    status={(capacityInfo.utilizationPercent ?? 0) >= 100 ? 'exception' : 'active'}
                                                    style={{ maxWidth: 360 }}
                                                />
                                            }
                                        />
                                    ) : null}
                                    <Form.Item
                                        label="数量"
                                        name="amount"
                                        rules={[
                                            { required: true, message: '请输入数量' },
                                            { type: 'number', min: 1, message: '数量必须大于0' },
                                            {
                                                validator: (_, value: number) => {
                                                    if (adjustType === 'in' && maxAdjustIn != null && value > maxAdjustIn) {
                                                        return Promise.reject(new Error(`入库数量不能超过仓位剩余容量（${maxAdjustIn}）`));
                                                    }
                                                    if (adjustType === 'out' && currentLocationStock != null && value > currentLocationStock) {
                                                        return Promise.reject(new Error(`出库数量不能超过当前可用库存（${currentLocationStock}）`));
                                                    }
                                                    return Promise.resolve();
                                                },
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            min={1}
                                            max={adjustType === 'in' ? maxAdjustIn : currentLocationStock ?? undefined}
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
                            children: logRows.length ? (
                                <Table
                                    size="small"
                                    rowKey="id"
                                    loading={inventoryLoading}
                                    dataSource={logRows.map((row) => ({
                                        ...row,
                                        time: row.createTime
                                            ? new Date(row.createTime).toLocaleString('zh-CN')
                                            : '-',
                                        type: row.typeLabel,
                                        amount:
                                            row.amount != null
                                                ? `${row.typeLabel?.includes('出') ? '-' : '+'}${row.amount}`
                                                : '-',
                                    }))}
                                    columns={logsColumns}
                                    pagination={{ pageSize: 10 }}
                                />
                            ) : (
                                <Empty description="暂无流水" />
                            ),
                        },
                        {
                            key: 'positions',
                            label: '仓位树',
                            children: positionRows.length ? (
                                <Table
                                    size="small"
                                    rowKey={(row) => `${row.warehouseId}-${row.positionId || 0}`}
                                    dataSource={positionRows}
                                    columns={[
                                        { title: '仓库', dataIndex: 'warehouseName', key: 'warehouseName' },
                                        { title: '仓位编码', dataIndex: 'code', key: 'code' },
                                        { title: '仓位名称', dataIndex: 'positionName', key: 'positionName' },
                                        { title: '数量', dataIndex: 'quantity', key: 'quantity' }
                                    ]}
                                    pagination={false}
                                    loading={inventoryLoading}
                                />
                            ) : positionTree.length ? (
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
