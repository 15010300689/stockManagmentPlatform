import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import QueryForm from '../components/PositionManagement/QueryForm';
import DataList from '../components/PositionManagement/DataList';
import AddPositionModal from '../components/PositionManagement/AddPositionModal';
import LocationInventoryDrawer from '../components/inventory/LocationInventoryDrawer';
import { requestWithAuth } from '../api/client';
import type { PositionItem, StoreItem } from '../types/inventory';
import type { PositionOccupancy } from '../types/inventoryOverview';
import {
    buildOccupancyMapFromFlat,
    type FlatInventoryRow,
    type PositionMeta,
} from '../utils/inventoryOverviewClient';

interface QueryParams {
    warehouseId: string;
    code: string;
    type: string;
    status: string;
}

interface TreeNode extends PositionItem {
    title: string;
    typeLabel: string;
    children?: TreeNode[];
}

interface DataListNode {
    id: number;
    code: string;
    name?: string;
    type: string;
    typeLabel: string;
    status: string;
    maxCapacity?: number;
    unit?: string;
    children?: DataListNode[];
}

interface PositionSubmitValues {
    warehouseId: number;
    parentId?: number | null;
    code: string;
    type: string;
    maxCapacity: number;
    unit: string;
    status: '0' | '1';
}

const API_BASE = '/api';
interface PositionResponseItem {
    id?: number | string;
    warehouseId?: number | string;
    warehouse_id?: number | string;
    parentId?: number | string | null;
    parent_id?: number | string | null;
    code?: string;
    name?: string;
    type?: string;
    status?: string | number;
    maxCapacity?: number | string;
    max_capacity?: number | string;
    unit?: string;
    createTime?: string;
    create_time?: string;
}

interface PositionListResponse {
    data?: PositionResponseItem[];
    total?: number;
    pageNo?: number;
    pageSize?: number;
}

interface StoreResponseItem {
    id?: number | string;
    code?: string;
    name?: string;
    address?: string;
    contact?: string;
    phone?: string;
    status?: string | number;
    createTime?: string;
    create_time?: string;
}

async function getErrorMessage(response: Response): Promise<string> {
    try {
        const payload = await response.json();
        if (typeof payload?.message === 'string' && payload.message.trim()) {
            return payload.message;
        }
    } catch {
        // ignore json parse errors
    }
    return `请求失败(${response.status})`;
}

function toNumberOrNull(value: unknown): number | null {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}

function mapPositionItem(item: PositionResponseItem): PositionItem | null {
    const id = toNumberOrNull(item.id);
    const warehouseId = toNumberOrNull(item.warehouseId ?? item.warehouse_id);
    if (id === null || warehouseId === null || !item.code || !item.type) {
        return null;
    }
    return {
        id,
        warehouseId,
        parentId: toNumberOrNull(item.parentId ?? item.parent_id),
        code: String(item.code),
        name: item.name ? String(item.name) : '',
        type: String(item.type),
        status: String(item.status ?? '1'),
        maxCapacity: Number(item.maxCapacity ?? item.max_capacity ?? 0),
        unit: item.unit ? String(item.unit) : '',
        createTime: item.createTime ?? item.create_time,
    };
}

function mapStoreItem(item: StoreResponseItem): StoreItem | null {
    const id = toNumberOrNull(item.id);
    if (id === null || !item.code || !item.name) {
        return null;
    }
    return {
        id,
        code: String(item.code),
        name: String(item.name),
        address: item.address ? String(item.address) : '',
        contact: item.contact ? String(item.contact) : '',
        phone: item.phone ? String(item.phone) : '',
        status: String(item.status ?? '1'),
        createTime: item.createTime ?? item.create_time,
    };
}

function PositionManagement(): JSX.Element {
    const [searchParams] = useSearchParams();
    const warehouseIdFromUrl = searchParams.get('warehouseId');
    const warehouseNameFromUrl = searchParams.get('warehouseName');

    const [queryParams, setQueryParams] = useState<QueryParams>({
        warehouseId: warehouseIdFromUrl || '',
        code: '',
        type: '',
        status: ''
    });

    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [positionInventoryOpen, setPositionInventoryOpen] = useState(false);
    const [inventoryPosition, setInventoryPosition] = useState<DataListNode | null>(null);
    const [currentPositionInfo, setCurrentPositionInfo] = useState<Partial<TreeNode>>({});
    const [dataSource, setDataSource] = useState<PositionItem[]>([]);
    const [warehouseList, setWarehouseList] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [occupancyMap, setOccupancyMap] = useState<Record<string, PositionOccupancy>>({});

    const loadPositionOccupancy = useCallback(async (whId: string) => {
        if (!whId) {
            setOccupancyMap({});
            return;
        }
        try {
            const occRes = await requestWithAuth(
                `${API_BASE}/stores/${encodeURIComponent(whId)}/position-occupancy`
            );
            if (occRes.ok) {
                const payload = await occRes.json();
                if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
                    setOccupancyMap(payload as Record<string, PositionOccupancy>);
                    return;
                }
            }

            const [invRes, posRes] = await Promise.all([
                requestWithAuth(`${API_BASE}/stores/${encodeURIComponent(whId)}/inventory`),
                requestWithAuth(`${API_BASE}/positions?warehouseId=${encodeURIComponent(whId)}`),
            ]);
            if (!invRes.ok) {
                setOccupancyMap({});
                return;
            }
            const invRows = (await invRes.json()) as FlatInventoryRow[];
            if (!Array.isArray(invRows)) {
                setOccupancyMap({});
                return;
            }
            let positions: PositionMeta[] = [];
            if (posRes.ok) {
                const posPayload = await posRes.json();
                if (Array.isArray(posPayload)) {
                    positions = posPayload as PositionMeta[];
                } else if (Array.isArray(posPayload?.data)) {
                    positions = posPayload.data as PositionMeta[];
                }
            }
            setOccupancyMap(buildOccupancyMapFromFlat(invRows, positions));
        } catch {
            setOccupancyMap({});
        }
    }, []);

    const requestStoreData = useCallback(async () => {
        const response = await requestWithAuth(`${API_BASE}/stores`);
        if (!response.ok) {
            throw new Error(`stores:${response.status}`);
        }
        const payload = await response.json();
        const rawList = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
                ? payload.data
                : null;
        if (!rawList) {
            throw new Error('仓库接口返回格式不正确');
        }
        const normalized = rawList
            .map((item: StoreResponseItem) => mapStoreItem(item))
            .filter((item: StoreItem | null): item is StoreItem => Boolean(item));
        setWarehouseList(normalized);
    }, []);

    const requestPositionData = useCallback(async () => {
        const params = new URLSearchParams();
        if (queryParams.warehouseId) {
            params.set('warehouseId', queryParams.warehouseId);
        }
        if (queryParams.code) {
            params.set('code', queryParams.code);
        }
        if (queryParams.type) {
            params.set('type', queryParams.type);
        }
        if (queryParams.status) {
            params.set('status', queryParams.status);
        }
        params.set('pageNo', String(pageNo));
        params.set('pageSize', String(pageSize));
        const query = params.toString();
        const url = query ? `${API_BASE}/positions?${query}` : `${API_BASE}/positions`;
        const response = await requestWithAuth(url);
        if (!response.ok) {
            throw new Error(`positions:${response.status}`);
        }
        const payload = (await response.json()) as PositionResponseItem[] | PositionListResponse;
        const rawList = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
                ? payload.data
                : null;
        if (!rawList) {
            throw new Error('仓位接口返回格式不正确');
        }
        const normalized = rawList
            .map((item: PositionResponseItem) => mapPositionItem(item))
            .filter((item: PositionItem | null): item is PositionItem => Boolean(item));
        setDataSource(normalized);
        if (Array.isArray(payload)) {
            setTotal(normalized.length);
        } else {
            setTotal(Number(payload.total ?? 0));
            setPageNo(Number(payload.pageNo ?? pageNo));
            setPageSize(Number(payload.pageSize ?? pageSize));
        }
    }, [pageNo, pageSize, queryParams.code, queryParams.status, queryParams.type, queryParams.warehouseId]);

    const requestInitialData = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([requestStoreData(), requestPositionData()]);
        } catch (error) {
            setWarehouseList([]);
            setDataSource([]);
            setTotal(0);
            setPageNo(1);
            setPageSize(10);
            message.error('加载仓位失败: ' + (error as Error).message);
            console.warn('load positions failed:', error);
        } finally {
            setLoading(false);
        }
    }, [requestPositionData, requestStoreData]);

    // 构建树状结构
    const buildTree = (data: PositionItem[], parentId: number | null = null): TreeNode[] => {
        return data
            .filter(item => {
                // 先匹配父节点关系
                const matchParent = (item.parentId === null && parentId === null) ||
                                   (item.parentId !== null && item.parentId === parentId) ||
                                   (item.parentId !== null && parentId !== null && String(item.parentId) === String(parentId));
                return matchParent;
            })
            .map(item => {
                const typeLabels: Record<string, string> = {
                    area: '库区',
                    shelf: '货架',
                    level: '层',
                    position: '仓位'
                };

                const children = buildTree(data, item.id);
                return {
                    ...item,
                    title: `${item.code} - ${item.name || ''}`,
                    typeLabel: typeLabels[item.type] || item.type,
                    children: children.length > 0 ? children : undefined
                };
            });
    };

    const treeData = useMemo(() => {
        return buildTree(dataSource);
    }, [dataSource]);

    const onSearch = (values: Partial<QueryParams>) => {
        setQueryParams({
            warehouseId: values.warehouseId || '',
            code: values.code || '',
            type: values.type || '',
            status: values.status || ''
        });
        setPageNo(1);
    };

    const onPageChange = (nextPageNo: number, nextPageSize: number) => {
        setPageNo(nextPageNo);
        setPageSize(nextPageSize);
    };

    const onAddPosition = () => {
        setCurrentPositionInfo({});
        setMode('add');
        setIsAddModalOpen(true);
    };

    const onEditPosition = (record: DataListNode) => {
        setCurrentPositionInfo(record as TreeNode);
        setMode('edit');
        setIsAddModalOpen(true);
    };

    const onDeletePosition = async (record: DataListNode) => {
        try {
            setLoading(true);
            const response = await requestWithAuth(`${API_BASE}/positions/${record.id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }
            message.success('删除仓位成功');
            await requestPositionData();
        } catch (error) {
            const errorMsg = (error as Error).message || '';
            message.error('删除失败: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: PositionSubmitValues, submitMode: 'add' | 'edit') => {
        try {
            setLoading(true);
            if (submitMode === 'add') {
                const response = await requestWithAuth(`${API_BASE}/positions`, {
                    method: 'POST',
                    body: JSON.stringify(values)
                });
                if (!response.ok) {
                    throw new Error(await getErrorMessage(response));
                }
                message.success('新增仓位成功');
                await requestPositionData();
            } else {
                const response = await requestWithAuth(`${API_BASE}/positions/${currentPositionInfo.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(values)
                });
                if (!response.ok) {
                    throw new Error(await getErrorMessage(response));
                }
                message.success('编辑仓位成功');
                await requestPositionData();
            }
            setIsAddModalOpen(false);
            setCurrentPositionInfo({});
        } catch (error) {
            const errorMsg = (error as Error).message || '';
            message.error('操作失败: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // 初始化时如果有URL参数，设置仓库筛选
    useEffect(() => {
        if (warehouseIdFromUrl) {
            setQueryParams(prev => ({
                ...prev,
                warehouseId: warehouseIdFromUrl
            }));
        }
    }, [warehouseIdFromUrl]);

    useEffect(() => {
        void requestInitialData();
    }, [requestInitialData]);

    useEffect(() => {
        void loadPositionOccupancy(queryParams.warehouseId);
    }, [queryParams.warehouseId, loadPositionOccupancy, dataSource]);

    return (
        <Card title={warehouseNameFromUrl ? `仓位管理 - ${decodeURIComponent(warehouseNameFromUrl)}` : '仓位管理'}>
            <QueryForm
                warehouseList={warehouseList}
                onSearch={onSearch}
                onAddPosition={onAddPosition}
            />
            <DataList
                treeData={treeData}
                occupancyMap={occupancyMap}
                onEdit={onEditPosition}
                onDelete={onDeletePosition}
                onViewInventory={(node) => {
                    setInventoryPosition(node);
                    setPositionInventoryOpen(true);
                }}
                loading={loading}
                pagination={{
                    current: pageNo,
                    pageSize,
                    total,
                    onChange: onPageChange
                }}
            />
            <AddPositionModal
                mode={mode}
                isOpen={isAddModalOpen}
                currentPositionInfo={currentPositionInfo}
                warehouseList={warehouseList}
                positionTree={dataSource}
                onCancel={() => {
                    setMode('add');
                    setCurrentPositionInfo({});
                    setIsAddModalOpen(false);
                }}
                onSubmit={handleSubmit}
            />
            <LocationInventoryDrawer
                open={positionInventoryOpen}
                onClose={() => {
                    setPositionInventoryOpen(false);
                    setInventoryPosition(null);
                }}
                mode="position"
                positionId={inventoryPosition?.id}
                positionLabel={
                    inventoryPosition
                        ? `${inventoryPosition.code}${inventoryPosition.name ? ` - ${inventoryPosition.name}` : ''}`
                        : undefined
                }
                positionMeta={
                    inventoryPosition
                        ? {
                              id: inventoryPosition.id,
                              code: inventoryPosition.code,
                              name: inventoryPosition.name,
                              type: inventoryPosition.type,
                              maxCapacity: inventoryPosition.maxCapacity,
                              unit: inventoryPosition.unit,
                          }
                        : undefined
                }
            />
        </Card>
    );
}

export default PositionManagement;
