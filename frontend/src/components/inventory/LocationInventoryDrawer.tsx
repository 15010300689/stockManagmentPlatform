import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Drawer,
    Table,
    Empty,
    Tag,
    Statistic,
    Row,
    Col,
    message,
    Tabs,
    Progress,
    Card,
    Space,
    Typography,
    Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { requestWithAuth } from '../../api/client';
import type {
    InventoryProductBrief,
    InventorySlotOverview,
    PositionInventoryOverview,
    WarehouseInventoryOverview,
} from '../../types/inventoryOverview';
import {
    buildPositionOverviewFromFlat,
    buildWarehouseOverviewFromFlat,
    type FlatInventoryRow,
    type PositionMeta,
} from '../../utils/inventoryOverviewClient';

const { Text } = Typography;
const API_BASE = '/api';

interface LocationInventoryDrawerProps {
    open: boolean;
    onClose: () => void;
    mode: 'warehouse' | 'position';
    warehouseId?: number;
    warehouseName?: string;
    positionId?: number;
    positionLabel?: string;
    /** 从仓位树带入的元数据，兼容模式下用于容量计算 */
    positionMeta?: PositionMeta;
}

function CapacityProgress(props: {
    used: number;
    max?: number;
    unit?: string;
    percent?: number | null;
}): JSX.Element {
    const { used, max = 0, unit = '件', percent } = props;
    if (!max || max <= 0) {
        return (
            <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                <Text type="secondary">该层级未设置容量上限，当前存放 {used} {unit}</Text>
            </Space>
        );
    }
    const p = percent ?? Math.min(100, Math.round((used / max) * 100));
    const status = p >= 100 ? 'exception' : p >= 85 ? 'active' : 'normal';
    return (
        <div>
            <Progress percent={p} status={status} format={() => `${used} / ${max} ${unit}`} />
            <Text type="secondary">
                已占用 {used} {unit}，剩余 {Math.max(max - used, 0)} {unit}
            </Text>
        </div>
    );
}

async function fetchJson<T>(url: string): Promise<{ ok: boolean; status: number; data: T | null }> {
    const response = await requestWithAuth(url);
    let data: T | null = null;
    try {
        data = (await response.json()) as T;
    } catch {
        data = null;
    }
    return { ok: response.ok, status: response.status, data };
}

function LocationInventoryDrawer(props: LocationInventoryDrawerProps): JSX.Element {
    const {
        open,
        onClose,
        mode,
        warehouseId,
        warehouseName,
        positionId,
        positionLabel,
        positionMeta,
    } = props;

    const [loading, setLoading] = useState(false);
    const [usedFallback, setUsedFallback] = useState(false);
    const [warehouseOverview, setWarehouseOverview] = useState<WarehouseInventoryOverview | null>(null);
    const [positionOverview, setPositionOverview] = useState<PositionInventoryOverview | null>(null);

    const title =
        mode === 'warehouse'
            ? `库存概览${warehouseName ? ` - ${warehouseName}` : ''}`
            : `仓位库存${positionLabel ? ` - ${positionLabel}` : ''}`;

    const loadWarehouseData = async (whId: number, whName: string) => {
        const tryUrls = [
            `${API_BASE}/stores/${whId}/inventory?overview=true`,
            `${API_BASE}/stores/${whId}/inventory/overview`,
        ];
        for (const url of tryUrls) {
            const { ok, status, data } = await fetchJson<WarehouseInventoryOverview>(url);
            if (ok && data && Array.isArray((data as WarehouseInventoryOverview).slots)) {
                setUsedFallback(false);
                setWarehouseOverview(data);
                return;
            }
            if (status !== 404 && status !== 405) {
                break;
            }
        }

        const [invResult, posResult] = await Promise.all([
            fetchJson<FlatInventoryRow[]>(`${API_BASE}/stores/${whId}/inventory`),
            fetchJson<PositionMeta[] | { data?: PositionMeta[] }>(`${API_BASE}/positions?warehouseId=${whId}`),
        ]);

        if (!invResult.ok || !Array.isArray(invResult.data)) {
            throw new Error('加载仓库库存失败，请确认后端已启动且已登录');
        }

        let positions: PositionMeta[] = [];
        if (posResult.ok && posResult.data) {
            if (Array.isArray(posResult.data)) {
                positions = posResult.data;
            } else if (Array.isArray(posResult.data.data)) {
                positions = posResult.data.data;
            }
        }

        setUsedFallback(true);
        setWarehouseOverview(buildWarehouseOverviewFromFlat(whId, whName, invResult.data, positions));
    };

    const loadPositionData = async (posId: number, meta?: PositionMeta) => {
        const tryUrls = [
            `${API_BASE}/positions/${posId}/inventory?overview=true`,
            `${API_BASE}/positions/${posId}/inventory/overview`,
        ];
        for (const url of tryUrls) {
            const { ok, status, data } = await fetchJson<PositionInventoryOverview>(url);
            if (ok && data && typeof (data as PositionInventoryOverview).usedQuantity === 'number') {
                setUsedFallback(false);
                setPositionOverview(data);
                return;
            }
            if (status !== 404 && status !== 405) {
                break;
            }
        }

        const invResult = await fetchJson<FlatInventoryRow[]>(`${API_BASE}/positions/${posId}/inventory`);
        if (!invResult.ok || !Array.isArray(invResult.data)) {
            throw new Error('加载仓位库存失败，请确认后端已启动且已登录');
        }

        const resolvedMeta: PositionMeta = meta ?? {
            id: posId,
            code: positionLabel?.split(' - ')[0] || String(posId),
            name: positionLabel,
            maxCapacity: 0,
            unit: '件',
        };

        setUsedFallback(true);
        setPositionOverview(
            buildPositionOverviewFromFlat(
                resolvedMeta,
                invResult.data[0]?.warehouseName || '',
                invResult.data
            )
        );
    };

    const loadData = useCallback(async () => {
        if (!open) return;
        setLoading(true);
        setUsedFallback(false);
        setWarehouseOverview(null);
        setPositionOverview(null);
        try {
            if (mode === 'warehouse' && warehouseId != null) {
                await loadWarehouseData(warehouseId, warehouseName || `仓库${warehouseId}`);
            } else if (mode === 'position' && positionId != null) {
                await loadPositionData(positionId, positionMeta);
            }
        } catch (error) {
            message.error((error as Error).message || '加载库存概览失败');
        } finally {
            setLoading(false);
        }
    }, [open, mode, warehouseId, warehouseName, positionId, positionLabel, positionMeta]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const productColumns: ColumnsType<InventoryProductBrief> = [
        { title: '商品ID', dataIndex: 'productId', width: 90, align: 'center' },
        { title: '商品名称', dataIndex: 'productName', align: 'center' },
        {
            title: '数量',
            dataIndex: 'quantity',
            width: 100,
            align: 'center',
            render: (q: number) => <strong>{q}</strong>,
        },
    ];

    const flatProducts = useMemo(() => {
        if (warehouseOverview?.slots) {
            return warehouseOverview.slots.flatMap((slot) =>
                slot.products.map((p) => ({
                    ...p,
                    positionLabel: slot.positionName || slot.positionCode || '仓库级',
                }))
            );
        }
        return (positionOverview?.products || []).map((p) => ({ ...p, positionLabel: positionLabel || '' }));
    }, [warehouseOverview, positionOverview, positionLabel]);

    const flatColumns: ColumnsType<InventoryProductBrief & { positionLabel?: string }> = [
        ...(mode === 'warehouse'
            ? [{ title: '所在仓位', dataIndex: 'positionLabel', key: 'positionLabel', align: 'center' as const }]
            : []),
        ...productColumns,
    ];

    const renderSlotCard = (slot: InventorySlotOverview) => {
        const typeLabels: Record<string, string> = {
            area: '库区',
            shelf: '货架',
            level: '层',
            position: '仓位',
            warehouse: '仓库级',
        };
        return (
            <Card
                key={slot.positionId ?? 'wh-level'}
                size="small"
                style={{ marginBottom: 12 }}
                title={
                    <Space>
                        <Text strong>
                            {slot.positionCode}{' '}
                            {slot.positionName && slot.positionName !== slot.positionCode ? slot.positionName : ''}
                        </Text>
                        {slot.type && <Tag>{typeLabels[slot.type] || slot.type}</Tag>}
                        <Tag color="blue">{slot.skuCount} 种商品</Tag>
                    </Space>
                }
            >
                <CapacityProgress
                    used={slot.usedQuantity}
                    max={slot.maxCapacity}
                    unit={slot.unit}
                    percent={slot.utilizationPercent}
                />
                {slot.products.length > 0 ? (
                    <Table
                        size="small"
                        style={{ marginTop: 12 }}
                        pagination={false}
                        rowKey="productId"
                        dataSource={slot.products}
                        columns={productColumns}
                    />
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无商品" />
                )}
            </Card>
        );
    };

    const warehouseTab = warehouseOverview && (
        <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Statistic title="仓位/库位" value={warehouseOverview.slotCount} />
                </Col>
                <Col span={6}>
                    <Statistic title="SKU 合计" value={warehouseOverview.totalSku} />
                </Col>
                <Col span={6}>
                    <Statistic title="件数合计" value={warehouseOverview.totalQuantity} />
                </Col>
            </Row>
            {warehouseOverview.slots.length === 0 ? (
                <Empty description="本仓库暂无库存" />
            ) : (
                warehouseOverview.slots.map(renderSlotCard)
            )}
        </div>
    );

    const positionTab = positionOverview && (
        <div>
            <Card size="small" style={{ marginBottom: 16 }}>
                <Space orientation="vertical" style={{ width: '100%' }}>
                    <Text>
                        所属仓库：<strong>{positionOverview.warehouseName || '—'}</strong>
                    </Text>
                    <CapacityProgress
                        used={positionOverview.usedQuantity}
                        max={positionOverview.maxCapacity}
                        unit={positionOverview.unit}
                        percent={positionOverview.utilizationPercent}
                    />
                    <Row gutter={16}>
                        <Col span={8}>
                            <Statistic title="SKU 数" value={positionOverview.skuCount} />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="已占用"
                                value={positionOverview.usedQuantity}
                                suffix={positionOverview.unit}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="剩余容量"
                                value={
                                    positionOverview.remainingQuantity != null
                                        ? positionOverview.remainingQuantity
                                        : '—'
                                }
                                suffix={positionOverview.maxCapacity ? positionOverview.unit : undefined}
                            />
                        </Col>
                    </Row>
                </Space>
            </Card>
            {positionOverview.products.length > 0 ? (
                <Table
                    size="small"
                    rowKey="productId"
                    dataSource={positionOverview.products}
                    columns={productColumns}
                    pagination={false}
                />
            ) : (
                <Empty description="该仓位暂无商品" />
            )}
        </div>
    );

    return (
        <Drawer title={title} size="large" open={open} onClose={onClose} destroyOnHidden width={720}>
            {usedFallback && (
                <Alert
                    type="warning"
                    showIcon
                    style={{ marginBottom: 12 }}
                    message="当前以后端基础库存接口组装的兼容视图；重启后端并更新权限后可使用完整概览接口。"
                />
            )}
            {!loading && mode === 'warehouse' && warehouseOverview && warehouseOverview.slots.length === 0 && (
                <Alert
                    type="info"
                    showIcon
                    message="本仓库暂无分仓库存，可在商品管理中入库并选择本仓库/仓位。"
                    style={{ marginBottom: 16 }}
                />
            )}
            <Tabs
                items={[
                    {
                        key: 'overview',
                        label: mode === 'warehouse' ? '按仓位查看' : '占用与商品',
                        children: loading ? (
                            <Empty description="加载中…" />
                        ) : mode === 'warehouse' ? (
                            warehouseTab || <Empty description="加载失败" />
                        ) : (
                            positionTab || <Empty description="加载失败" />
                        ),
                    },
                    {
                        key: 'flat',
                        label: '商品明细',
                        children: (
                            <Table
                                size="small"
                                loading={loading}
                                rowKey={(r) => `${r.productId}-${r.positionLabel || ''}`}
                                dataSource={flatProducts}
                                columns={flatColumns}
                                pagination={{ pageSize: 10 }}
                                locale={{ emptyText: loading ? '加载中…' : '暂无商品' }}
                            />
                        ),
                    },
                ]}
            />
        </Drawer>
    );
}

export default LocationInventoryDrawer;
