import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Select, Space, Table, Tag, message, Row, Col, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { requestWithAuth } from '../api/client';

const API_BASE = '/api';

interface OptionItem {
    label: string;
    value: number;
}

interface ProductResponseItem {
    id?: number | string;
    name?: string;
}

interface StoreResponseItem {
    id?: number | string;
    name?: string;
}

interface PositionResponseItem {
    id?: number | string;
    code?: string;
    name?: string;
}

interface InventoryLogRow {
    id: number;
    createTime?: string;
    productId?: number;
    productName?: string;
    warehouseId?: number;
    warehouseName?: string;
    positionId?: number;
    positionName?: string;
    type?: string;
    typeLabel?: string;
    amount?: number;
    remark?: string;
}

interface FilterValues {
    productId?: number;
    warehouseId?: number;
    positionId?: number;
}

function formatDateTime(value?: string): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function normalizeProductOptions(payload: unknown): OptionItem[] {
    const rawList = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as { data?: unknown[] })?.data)
            ? (payload as { data: unknown[] }).data
            : [];
    return rawList
        .map((item: ProductResponseItem) => {
            const value = Number(item.id);
            if (!Number.isFinite(value) || !item.name) return null;
            return { value, label: String(item.name) };
        })
        .filter((item): item is OptionItem => Boolean(item));
}

function normalizeStoreOptions(payload: unknown): OptionItem[] {
    const rawList = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as { data?: unknown[] })?.data)
            ? (payload as { data: unknown[] }).data
            : [];
    return rawList
        .map((item: StoreResponseItem) => {
            const value = Number(item.id);
            if (!Number.isFinite(value) || !item.name) return null;
            return { value, label: String(item.name) };
        })
        .filter((item): item is OptionItem => Boolean(item));
}

function normalizePositionOptions(payload: unknown): OptionItem[] {
    const rawList = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as { data?: unknown[] })?.data)
            ? (payload as { data: unknown[] }).data
            : [];
    return rawList
        .map((item: PositionResponseItem) => {
            const value = Number(item.id);
            if (!Number.isFinite(value)) return null;
            const code = item.code ? String(item.code) : '';
            const name = item.name ? String(item.name) : '';
            return { value, label: `${code}${name && name !== code ? ` - ${name}` : ''}` || String(value) };
        })
        .filter((item): item is OptionItem => Boolean(item));
}

function InventoryLogs(): JSX.Element {
    const [form] = Form.useForm<FilterValues>();
    const [rows, setRows] = useState<InventoryLogRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [productOptions, setProductOptions] = useState<OptionItem[]>([]);
    const [storeOptions, setStoreOptions] = useState<OptionItem[]>([]);
    const [positionOptions, setPositionOptions] = useState<OptionItem[]>([]);

    const loadOptions = useCallback(async () => {
        try {
            const [productsRes, storesRes, positionsRes] = await Promise.all([
                requestWithAuth(`${API_BASE}/products?pageNo=1&pageSize=100`),
                requestWithAuth(`${API_BASE}/stores`),
                requestWithAuth(`${API_BASE}/positions`),
            ]);
            if (productsRes.ok) setProductOptions(normalizeProductOptions(await productsRes.json()));
            if (storesRes.ok) setStoreOptions(normalizeStoreOptions(await storesRes.json()));
            if (positionsRes.ok) setPositionOptions(normalizePositionOptions(await positionsRes.json()));
        } catch (error) {
            console.warn('load log filter options failed:', error);
        }
    }, []);

    const loadLogs = useCallback(async (values?: FilterValues) => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (values?.productId) query.set('productId', String(values.productId));
            if (values?.warehouseId) query.set('warehouseId', String(values.warehouseId));
            if (values?.positionId) query.set('positionId', String(values.positionId));
            const url = query.toString()
                ? `${API_BASE}/inventory/logs?${query.toString()}`
                : `${API_BASE}/inventory/logs`;
            const response = await requestWithAuth(url);
            const payload = await response.json().catch(() => null);
            if (!response.ok || !Array.isArray(payload)) {
                throw new Error((payload as { message?: string })?.message || `请求失败(${response.status})`);
            }
            setRows(payload as InventoryLogRow[]);
        } catch (error) {
            setRows([]);
            message.error('加载库存流水失败: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadOptions();
        void loadLogs();
    }, [loadLogs, loadOptions]);

    const logStats = useMemo(() => {
        return rows.reduce(
            (acc, row) => {
                acc.total += 1;
                if (row.type === 'in') acc.inCount += 1;
                if (row.type === 'out') acc.outCount += 1;
                return acc;
            },
            { total: 0, inCount: 0, outCount: 0 }
        );
    }, [rows]);

    const columns: ColumnsType<InventoryLogRow> = [
        { title: '时间', dataIndex: 'createTime', key: 'createTime', width: 170, render: formatDateTime },
        { title: '商品', dataIndex: 'productName', key: 'productName', ellipsis: true, render: (text) => text || '-' },
        { title: '仓库', dataIndex: 'warehouseName', key: 'warehouseName', ellipsis: true, render: (text) => text || '-' },
        { title: '仓位', dataIndex: 'positionName', key: 'positionName', ellipsis: true, render: (text) => text || '仓库级' },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 90,
            align: 'center',
            render: (type: string, record) => (
                <Tag color={type === 'in' ? 'green' : type === 'out' ? 'red' : 'blue'}>
                    {record.typeLabel || type || '-'}
                </Tag>
            ),
        },
        { title: '数量', dataIndex: 'amount', key: 'amount', width: 90, align: 'center' },
        { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true, render: (text) => text || '-' },
    ];

    return (
        <Card title="库存流水">
            <Form form={form} layout="inline" onFinish={(values) => void loadLogs(values)} style={{ marginBottom: 16 }}>
                <Form.Item name="productId" label="商品">
                    <Select
                        allowClear
                        showSearch
                        placeholder="全部商品"
                        style={{ width: 180 }}
                        optionFilterProp="label"
                        options={productOptions}
                    />
                </Form.Item>
                <Form.Item name="warehouseId" label="仓库">
                    <Select allowClear placeholder="全部仓库" style={{ width: 160 }} options={storeOptions} />
                </Form.Item>
                <Form.Item name="positionId" label="仓位">
                    <Select
                        allowClear
                        showSearch
                        placeholder="全部仓位"
                        style={{ width: 190 }}
                        optionFilterProp="label"
                        options={positionOptions}
                    />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>查询</Button>
                        <Button
                            onClick={() => {
                                form.resetFields();
                                void loadLogs();
                            }}
                        >
                            重置
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                    <Card size="small">
                        <Statistic title="流水总数" value={logStats.total} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card size="small">
                        <Statistic title="入库次数" value={logStats.inCount} valueStyle={{ color: '#3f8600' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card size="small">
                        <Statistic title="出库次数" value={logStats.outCount} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </Col>
            </Row>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={rows}
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条记录` }}
            />
        </Card>
    );
}

export default InventoryLogs;
