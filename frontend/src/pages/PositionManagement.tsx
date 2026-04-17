import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import QueryForm from '../components/PositionManagement/QueryForm';
import DataList from '../components/PositionManagement/DataList';
import AddPositionModal from '../components/PositionManagement/AddPositionModal';
import { authFetch } from '../auth';
import { positionList } from '../mock/positionList';
import { storeList } from '../mock/storeList';
import type { PositionItem, StoreItem } from '../types/inventory';

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
    parentId: number;
    code: string;
    type: string;
    maxCapacity: number;
    unit: string;
    status: '0' | '1';
}

const API_BASE = '/api';
const fallbackPositions = [...positionList];
const fallbackStores = [...storeList];

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

function shouldFallbackByStatus(status: number): boolean {
    return status === 404 || status === 405 || status >= 500;
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
    const [currentPositionInfo, setCurrentPositionInfo] = useState<Partial<TreeNode>>({});
    const [dataSource, setDataSource] = useState<PositionItem[]>(fallbackPositions);
    const [warehouseList, setWarehouseList] = useState<StoreItem[]>(fallbackStores);
    const [loading, setLoading] = useState(false);

    const requestStoreData = useCallback(async () => {
        const response = await authFetch(`${API_BASE}/stores`);
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
        const query = params.toString();
        const url = query ? `${API_BASE}/positions?${query}` : `${API_BASE}/positions`;
        const response = await authFetch(url);
        if (!response.ok) {
            throw new Error(`positions:${response.status}`);
        }
        const payload = await response.json();
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
    }, [queryParams.warehouseId]);

    const requestInitialData = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([requestStoreData(), requestPositionData()]);
        } catch (error) {
            setWarehouseList(fallbackStores);
            setDataSource(fallbackPositions);
            message.warning('后端服务异常，仓位管理已切换为 mock 数据展示');
            console.warn('load positions failed, fallback to mock data:', error);
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

                if (!matchParent) return false;

                // 应用筛选条件
                const matchWarehouse = !queryParams.warehouseId || item.warehouseId === parseInt(queryParams.warehouseId, 10);
                const matchCode = !queryParams.code || item.code.toLowerCase().includes(queryParams.code.toLowerCase());
                const matchType = !queryParams.type || item.type === queryParams.type;
                const matchStatus = !queryParams.status || item.status === queryParams.status;

                return matchWarehouse && matchCode && matchType && matchStatus;
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
    }, [dataSource, queryParams]);

    const onSearch = (values: Partial<QueryParams>) => {
        setQueryParams({
            warehouseId: values.warehouseId || '',
            code: values.code || '',
            type: values.type || '',
            status: values.status || ''
        });
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
            const response = await authFetch(`${API_BASE}/positions/${record.id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                if (shouldFallbackByStatus(response.status)) {
                    throw new Error(`fallback:${response.status}`);
                }
                throw new Error(await getErrorMessage(response));
            }
            message.success('删除仓位成功');
            await requestPositionData();
        } catch (error) {
            const errorMsg = (error as Error).message || '';
            if (errorMsg.startsWith('fallback:')) {
                setDataSource((prev) => prev.filter((item) => item.id !== record.id));
                message.warning('后端删除接口不可用，已切换为 mock 删除');
                return;
            }
            message.error('删除失败: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: PositionSubmitValues, submitMode: 'add' | 'edit') => {
        try {
            setLoading(true);
            if (submitMode === 'add') {
                const response = await authFetch(`${API_BASE}/positions`, {
                    method: 'POST',
                    body: JSON.stringify(values)
                });
                if (!response.ok) {
                    if (shouldFallbackByStatus(response.status)) {
                        throw new Error(`fallback:${response.status}`);
                    }
                    throw new Error(await getErrorMessage(response));
                }
                message.success('新增仓位成功');
                await requestPositionData();
            } else {
                const response = await authFetch(`${API_BASE}/positions/${currentPositionInfo.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(values)
                });
                if (!response.ok) {
                    if (shouldFallbackByStatus(response.status)) {
                        throw new Error(`fallback:${response.status}`);
                    }
                    throw new Error(await getErrorMessage(response));
                }
                message.success('编辑仓位成功');
                await requestPositionData();
            }
            setIsAddModalOpen(false);
            setCurrentPositionInfo({});
        } catch (error) {
            const errorMsg = (error as Error).message || '';
            if (errorMsg.startsWith('fallback:')) {
                if (submitMode === 'add') {
                    const newPosition: PositionItem = {
                        id: Date.now(),
                        ...values,
                        name: values.code,
                        createTime: new Date().toISOString()
                    };
                    setDataSource((prev) => [...prev, newPosition]);
                    message.warning('后端新增接口不可用，已切换为 mock 新增');
                } else {
                    setDataSource((prev) => prev.map(item =>
                        item.id === currentPositionInfo.id
                            ? { ...item, ...values, name: values.code }
                            : item
                    ));
                    message.warning('后端编辑接口不可用，已切换为 mock 编辑');
                }
                setIsAddModalOpen(false);
                setCurrentPositionInfo({});
                return;
            }
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

    return (
        <Card title={warehouseNameFromUrl ? `仓位管理 - ${decodeURIComponent(warehouseNameFromUrl)}` : '仓位管理'}>
            <QueryForm
                warehouseList={warehouseList}
                onSearch={onSearch}
                onAddPosition={onAddPosition}
            />
            <DataList
                treeData={treeData}
                onEdit={onEditPosition}
                onDelete={onDeletePosition}
                loading={loading}
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
        </Card>
    );
}

export default PositionManagement;
