import React, { useCallback, useEffect, useState } from 'react';
import { Card, Space, Button, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import QueryForm from '../components/StoreManagement/QueryForm';
import DataList from '../components/StoreManagement/DataList';
import AddStoreModal from '../components/StoreManagement/AddStoreModal';
import LocationInventoryDrawer from '../components/inventory/LocationInventoryDrawer';
import { requestWithAuth } from '../api/client';
import type { StoreItem } from '../types/inventory';

interface QueryParams {
    keyword: string;
    status: string;
}

interface QueryValues {
    keyword?: string;
    status?: string;
}

const API_BASE = '/api';

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

interface StoreListResponse {
    data?: StoreResponseItem[];
    total?: number;
    pageNo?: number;
    pageSize?: number;
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

function mapStoreItem(item: StoreResponseItem): StoreItem | null {
    if (item.id === undefined || item.id === null || !item.code || !item.name) {
        return null;
    }
    return {
        id: Number(item.id),
        code: String(item.code),
        name: String(item.name),
        address: item.address ? String(item.address) : '',
        contact: item.contact ? String(item.contact) : '',
        phone: item.phone ? String(item.phone) : '',
        status: String(item.status ?? '1'),
        createTime: item.createTime ?? item.create_time,
    };
}

function formatDateTime(value?: string): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const pad = (num: number) => String(num).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function StoreManagement(): JSX.Element {
    const navigate = useNavigate();
    const [queryParams, setQueryParams] = useState<QueryParams>({
        keyword: '',
        status: ''
    });

    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentStoreInfo, setCurrentStoreInfo] = useState<Partial<StoreItem>>({});
    const [dataSource, setDataSource] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [inventoryDrawerOpen, setInventoryDrawerOpen] = useState(false);
    const [inventoryWarehouse, setInventoryWarehouse] = useState<StoreItem | null>(null);

    const requestTableData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (queryParams.keyword) {
                params.set('keyword', queryParams.keyword);
            }
            if (queryParams.status) {
                params.set('status', queryParams.status);
            }
            params.set('pageNo', String(pageNo));
            params.set('pageSize', String(pageSize));
            const response = await requestWithAuth(`${API_BASE}/stores?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`请求失败(${response.status})`);
            }
            const payload = (await response.json()) as StoreResponseItem[] | StoreListResponse;
            const rawList = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.data)
                    ? payload.data
                    : null;
            if (!rawList) {
                throw new Error('接口返回格式不正确');
            }

            const normalized = rawList
                .map((item: StoreResponseItem) => mapStoreItem(item))
                .filter((item: StoreItem | null): item is StoreItem => Boolean(item));

            setDataSource(normalized);
            if (Array.isArray(payload)) {
                setTotal(normalized.length);
            } else {
                setTotal(Number(payload.total ?? 0));
                setPageNo(Number(payload.pageNo ?? pageNo));
                setPageSize(Number(payload.pageSize ?? pageSize));
            }
        } catch (error) {
            setDataSource([]);
            setTotal(0);
            setPageNo(1);
            setPageSize(10);
            message.error('加载仓库失败: ' + (error as Error).message);
            console.warn('load stores failed:', error);
        } finally {
            setLoading(false);
        }
    }, [pageNo, pageSize, queryParams.keyword, queryParams.status]);

    useEffect(() => {
        void requestTableData();
    }, [requestTableData]);

    const columns: ColumnsType<StoreItem> = [
        {
            title: '仓库编码',
            dataIndex: 'code',
            key: 'code',
            width: 120,
            align: 'center',
            fixed: 'left',
        },
        {
            title: '仓库名称',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            fixed: 'left',
        },
        {
            title: '仓库地址',
            dataIndex: 'address',
            key: 'address',
            align: 'center',
        },
        {
            title: '联系人',
            dataIndex: 'contact',
            key: 'contact',
            align: 'center',
        },
        {
            title: '联系电话',
            dataIndex: 'phone',
            key: 'phone',
            align: 'center',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status: string) => (
                <Tag color={status === '1' ? 'green' : 'red'}>
                    {status === '1' ? '启用' : '停用'}
                </Tag>
            )
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            align: 'center',
            render: (createTime?: string) => (
                <span>{formatDateTime(createTime)}</span>
            )
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            width: 260,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            setInventoryWarehouse(record);
                            setInventoryDrawerOpen(true);
                        }}
                    >
                        库存概览
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handleView(record)}
                    >
                        仓位
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => onEditStore(record)}
                    >
                        编辑
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => onDeleteStore(record)}
                    >
                        删除
                    </Button>
                </Space>
            ),
        }
    ];

    const onSearch = (values: QueryValues) => {
        setQueryParams({
            keyword: values.keyword || '',
            status: values.status || ''
        });
        setPageNo(1);
    };

    const onPageChange = (nextPageNo: number, nextPageSize: number) => {
        setPageNo(nextPageNo);
        setPageSize(nextPageSize);
    };

    const onAddStore = () => {
        setCurrentStoreInfo({});
        setMode('add');
        setIsAddModalOpen(true);
    };

    const onEditStore = (record: StoreItem) => {
        setCurrentStoreInfo(record);
        setMode('edit');
        setIsAddModalOpen(true);
    };

    const onDeleteStore = async (record: StoreItem) => {
        try {
            setLoading(true);
            const response = await requestWithAuth(`${API_BASE}/stores/${record.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            message.success('删除仓库成功');
            await requestTableData();
        } catch (error) {
            const errorMsg = (error as Error).message || '';
            message.error('删除失败: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (record: StoreItem) => {
        // 跳转到仓位管理页，并将该仓库作为筛选条件
        navigate(`/positionManagement?warehouseId=${record.id}&warehouseName=${encodeURIComponent(record.name)}`);
    };

    const handleSubmit = async (values: Partial<StoreItem>, submitMode: 'add' | 'edit') => {
        try {
            setLoading(true);
            if (submitMode === 'add') {
                const response = await requestWithAuth(`${API_BASE}/stores`, {
                    method: 'POST',
                    body: JSON.stringify(values)
                });
                if (!response.ok) {
                    throw new Error(await getErrorMessage(response));
                }

                message.success('新增仓库成功');
                await requestTableData();
            } else {
                const response = await requestWithAuth(`${API_BASE}/stores/${currentStoreInfo.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(values)
                });
                if (!response.ok) {
                    throw new Error(await getErrorMessage(response));
                }

                message.success('编辑仓库成功');
                await requestTableData();
            }
            setIsAddModalOpen(false);
            setCurrentStoreInfo({});
        } catch (error) {
            const errorMsg = (error as Error).message || '';
            message.error('操作失败: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="仓库管理">
            <QueryForm
                onSearch={onSearch}
                onAddStore={onAddStore}
            />
            <DataList
                columns={columns}
                dataSource={dataSource}
                tableProps={{
                    loading,
                    pagination: {
                        current: pageNo,
                        pageSize,
                        total,
                        showSizeChanger: true,
                        onChange: onPageChange,
                        showTotal: (count) => `共 ${count} 条记录`,
                    }
                }}
            />
            <AddStoreModal
                mode={mode}
                isOpen={isAddModalOpen}
                currentStoreInfo={currentStoreInfo}
                onCancel={() => {
                    setMode('add');
                    setCurrentStoreInfo({});
                    setIsAddModalOpen(false);
                }}
                onSubmit={handleSubmit}
            />
            <LocationInventoryDrawer
                open={inventoryDrawerOpen}
                onClose={() => {
                    setInventoryDrawerOpen(false);
                    setInventoryWarehouse(null);
                }}
                mode="warehouse"
                warehouseId={inventoryWarehouse?.id}
                warehouseName={inventoryWarehouse?.name}
            />
        </Card>
    );
}

export default StoreManagement;
