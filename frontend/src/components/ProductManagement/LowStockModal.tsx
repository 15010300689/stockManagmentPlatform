import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Button, Table, InputNumber, Space, Tag, message, Alert, Typography, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { requestWithAuth } from '../../api/client';
import { shouldFallbackToMockByResponse } from '../../mock/apiMock';

import { mockLowStockProducts } from '../../mock/productManagement';
import type { ProductItem } from '../../types/inventory';

const API_BASE = '/api';
const THRESHOLD_STORAGE_KEY = 'low_stock_threshold';

interface LowStockModalProps {
    visible: boolean;
    onClose: () => void;
    /** 从预警列表跳转去入库（父组件关闭本弹窗并打开入库） */
    onOpenStockIn?: (product: ProductItem) => void | Promise<void>;
    /** 打开分仓库存抽屉 */
    onOpenInventory?: (product: ProductItem) => void;
}

function normalizeRows(raw: unknown): ProductItem[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((row: Record<string, unknown>) => ({
        id: row.id as string | number,
        name: String(row.name ?? ''),
        category: String(row.category ?? ''),
        price: Number(row.price ?? 0),
        quantity: Number(row.quantity ?? 0),
        safeStock: row.safeStock != null ? Number(row.safeStock) : undefined,
        status: row.status != null ? Number(row.status) : undefined,
    }));
}

function filterMockLowStock(threshold: number): ProductItem[] {
    const t = Math.max(1, Math.floor(threshold));
    return (mockLowStockProducts || []).filter((p) => {
        const ss = p.safeStock;
        if (ss != null && Number.isFinite(Number(ss))) {
            return p.quantity < Number(ss);
        }
        return p.quantity < t;
    });
}

function LowStockModal({ visible, onClose, onOpenStockIn, onOpenInventory }: LowStockModalProps): JSX.Element {
    const [threshold, setThreshold] = useState(() => {
        try {
            const n = Number(localStorage.getItem(THRESHOLD_STORAGE_KEY));
            return Number.isFinite(n) && n >= 1 ? n : 10;
        } catch {
            return 10;
        }
    });
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [fromMock, setFromMock] = useState(false);
    const thresholdRef = useRef(threshold);
    thresholdRef.current = threshold;

    const fetchLowStock = useCallback(async () => {
        setLoading(true);
        setFromMock(false);
        const t = Math.max(1, Math.floor(thresholdRef.current));
        try {
            const response = await requestWithAuth(`${API_BASE}/low-stock?threshold=${t}`);
            const data = await response.json().catch(() => null);
            if (response.ok && Array.isArray(data)) {
                setProducts(normalizeRows(data));
                return;
            }
            if (shouldFallbackToMockByResponse(`${API_BASE}/low-stock?threshold=${t}`, response)) {
                setProducts(filterMockLowStock(t));
                setFromMock(true);
                message.warning('后端不可用，已使用本地 mock 数据演示');
                return;
            }
            setProducts([]);
            message.error((data as { message?: string })?.message || `查询失败（${response.status}）`);
        } catch (error) {
            setProducts(filterMockLowStock(t));
            setFromMock(true);
            message.warning('请求异常，已使用本地 mock 数据演示');
            console.warn(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!visible) return;
        void fetchLowStock();
    }, [visible, fetchLowStock]);

    const handleThresholdChange = (v: number | null) => {
        const next = v ?? 10;
        setThreshold(next);
        try {
            localStorage.setItem(THRESHOLD_STORAGE_KEY, String(Math.max(1, Math.floor(next))));
        } catch {
            /* ignore */
        }
    };

    const handleQuery = () => {
        void fetchLowStock();
    };

    const columns: ColumnsType<ProductItem> = [
        {
            title: '商品ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            align: 'center',
            render: (id: string | number) => <span style={{ fontFamily: 'monospace' }}>{id}</span>,
        },
        {
            title: '商品名称',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
        },
        {
            title: '类别',
            dataIndex: 'category',
            key: 'category',
            width: 110,
            render: (category: string) => <Tag color="blue">{category || '-'}</Tag>,
        },
        {
            title: '安全库存',
            dataIndex: 'safeStock',
            key: 'safeStock',
            width: 100,
            align: 'center',
            render: (v: number | undefined) => (v != null && Number.isFinite(v) ? v : <Typography.Text type="secondary">—</Typography.Text>),
        },
        {
            title: '当前总库存',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 110,
            align: 'center',
            render: (quantity: number, record) => {
                const th = Math.max(1, Math.floor(threshold));
                const hasSafe = record.safeStock != null && Number.isFinite(Number(record.safeStock));
                const safeNum = hasSafe ? Number(record.safeStock) : null;
                const gapToSafe = hasSafe && safeNum != null ? safeNum - quantity : null;
                const gapToThreshold = !hasSafe ? th - quantity : null;
                const belowSafe = hasSafe && safeNum != null && quantity < safeNum;
                return (
                    <Space direction="vertical" size={0}>
                        <Tag color="red">{quantity}</Tag>
                        {gapToSafe != null && gapToSafe > 0 && (
                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                距安全库存差 {gapToSafe}
                            </Typography.Text>
                        )}
                        {gapToThreshold != null && gapToThreshold > 0 && (
                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                低于全局阈值 {gapToThreshold}
                            </Typography.Text>
                        )}
                        {belowSafe && (
                            <Tag color="orange" style={{ marginInlineEnd: 0 }}>
                                低于安全库存
                            </Tag>
                        )}
                    </Space>
                );
            },
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            width: 100,
            align: 'right',
            render: (price: number) => `¥${Number(price || 0).toFixed(2)}`,
        },
        {
            title: '操作',
            key: 'actions',
            width: 160,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button type="link" size="small" onClick={() => void onOpenStockIn?.(record)}>
                        入库
                    </Button>
                    <Button type="link" size="small" onClick={() => onOpenInventory?.(record)}>
                        库存
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Modal
            title="低库存预警"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="refresh" onClick={() => void fetchLowStock()} loading={loading}>
                    刷新
                </Button>,
                <Button key="close" type="primary" onClick={onClose}>
                    关闭
                </Button>,
            ]}
            width={880}
            destroyOnClose
        >
            <Alert
                type="info"
                showIcon
                style={{ marginBottom: 12 }}
                message="判定规则（与数据库一致）"
                description={
                    <span>
                        数据来自接口查询数据库：<strong>已设置安全库存</strong>的商品，满足「总库存 quantity &lt; 安全库存 safe_stock」会进入列表；
                        <strong>未设置安全库存</strong>的商品，则按「总库存 &lt; 下方阈值」判断。
                        均为商品主档字段，与分仓库存明细无直接比较。
                    </span>
                }
            />
            {fromMock && (
                <Alert type="warning" showIcon style={{ marginBottom: 12 }} message="当前为 mock 数据，与真实数据库可能不一致" />
            )}
            <Space style={{ marginBottom: 16 }} wrap>
                <Tooltip title="仅对「未设置安全库存」的商品生效；已设置安全库存的只看 safe_stock。阈值保存在本浏览器。">
                    <span>全局阈值（无安全库存时）：</span>
                </Tooltip>
                <InputNumber value={threshold} onChange={handleThresholdChange} min={1} max={999999} precision={0} />
                <Button type="primary" onClick={handleQuery} loading={loading}>
                    重新查询
                </Button>
                <Typography.Text type="secondary">
                    共 <strong>{products.length}</strong> 条
                </Typography.Text>
            </Space>
            <Table<ProductItem>
                columns={columns}
                dataSource={products}
                rowKey={(r) => String(r.id)}
                loading={loading}
                scroll={{ x: 820 }}
                pagination={
                    products.length > 8
                        ? { pageSize: 8, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }
                        : false
                }
                locale={{
                    emptyText: loading
                        ? '加载中…'
                        : `当前没有低库存记录（有安全库存：quantity < safe_stock；无安全库存：quantity < ${Math.max(1, Math.floor(threshold))}）`,
                }}
            />
        </Modal>
    );
}

export default LowStockModal;
