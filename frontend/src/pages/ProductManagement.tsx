import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Form,
    Input,
    message,
    Space,
    Card,
    Statistic,
    Row,
    Col,
    Tag,
    Popconfirm,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { hasPermission } from '../auth';
import { requestWithAuth } from '../api/client';
import StatisticsModal from '../components/ProductManagement/StatisticsModal';
import LowStockModal     from '../components/ProductManagement/LowStockModal';
import AddProductModal from '../components/ProductManagement/AddProductModal';
import OutOrInStockModal from '../components/ProductManagement/OutOrInStockModal';
import InventoryDrawer from '../components/ProductManagement/InventoryDrawer';
import {
    mockProducts,
    mockStatics
} from '../mock/productManagement';
import { storeList } from '../mock/storeList';
import { positionList } from '../mock/positionList';


const API_BASE = '/api';

type StockType = 'in' | 'out';

interface ProductItem {
    id: string | number;
    name: string;
    category: string;
    price: number;
    quantity: number;
    totalValue?: number;
    safeStock?: number;
    status?: number;
}

interface Stats {
    productCount: number;
    totalValue: number;
    categories: string[];
}

interface StoreItem {
    id: number;
    code: string;
    name: string;
    status: string;
}


interface ProductListResponse {
    data?: ProductItem[];
    total?: number;
    pageNo?: number;
    pageSize?: number;
}

interface PositionNodeItem {
    id: number;
    warehouseId: number;
    parentId: number | null;
    code: string;
    name?: string;
    status: string;
    type: string;
    maxCapacity: number;
    unit?: string;
}

function ProductManagement() {
    const [products, setProducts] = useState<ProductItem[]>(mockProducts as ProductItem[]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<Stats>((mockStatics as Stats) || { productCount: 0, totalValue: 0, categories: [] });
    /** 输入框中的关键字（仅展示，不触发列表过滤） */
    const [searchInput, setSearchInput] = useState('');
    /** 点击「搜索」后生效的关键字，用于请求接口；刷新/增删改后仍按该条件拉列表 */
    const [appliedSearch, setAppliedSearch] = useState('');
    const [warehouseOptions, setWarehouseOptions] = useState<StoreItem[]>(storeList as unknown as StoreItem[]);
    const [positionOptions, setPositionOptions] = useState<PositionNodeItem[]>(positionList as unknown as PositionNodeItem[]);
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState((mockProducts as ProductItem[]).length);

    // 模态框状态
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [stockModalVisible, setStockModalVisible] = useState(false);
    const [statisticsModalVisible, setStatisticsModalVisible] = useState(false);
    const [lowStockModalVisible, setLowStockModalVisible] = useState(false);
    const [inventoryDrawerVisible, setInventoryDrawerVisible] = useState(false);

    // 表单实例
    const [productForm] = Form.useForm();

    // 当前操作的商品ID和类型
    const [currentProductId, setCurrentProductId] = useState<string | null>(null);
    const [currentStockType, setCurrentStockType] = useState<StockType>('in');
    const [currentProduct, setCurrentProduct] = useState<ProductItem | null>(null);
    const [inventoryProduct, setInventoryProduct] = useState<ProductItem | null>(null);

    const canAdd = hasPermission('product:add');
    const canEdit = hasPermission('product:edit');
    const canDelete = hasPermission('product:delete');
    const canViewStatistics = hasPermission('product:statistics');
    const canViewLowStock = hasPermission('product:lowstock');
    const canViewDetail = hasPermission('product:detail');

    // 组件挂载时加载数据
    useEffect(() => {
        loadProducts();
        loadStatistics();
        loadWarehousesAndPositions();
    }, []);

    // 加载商品列表（nameQuery 仅在「搜索」等场景显式传入，避免与 appliedSearch 更新不同步）
    const loadProducts = async (params?: { nameQuery?: string; pageNo?: number; pageSize?: number }) => {
        setLoading(true);
        try {
            const effective = params?.nameQuery !== undefined
                ? params.nameQuery.trim()
                : appliedSearch.trim();
            const currentPageNo = params?.pageNo ?? pageNo;
            const currentPageSize = params?.pageSize ?? pageSize;
            const query = new URLSearchParams();
            if (effective) {
                query.set('name', effective);
            }
            query.set('pageNo', String(currentPageNo));
            query.set('pageSize', String(currentPageSize));
            const url = `${API_BASE}/products?${query.toString()}`;
            const response = await requestWithAuth(url);
            const payload = await response.json();
            if (Array.isArray(payload)) {
                setProducts(payload as ProductItem[]);
                setTotal((payload as ProductItem[]).length);
                setPageNo(currentPageNo);
                setPageSize(currentPageSize);
                return;
            }

            const data = payload as ProductListResponse;
            const list = Array.isArray(data?.data) ? data.data : [];
            setProducts(list);
            setTotal(Number(data?.total ?? 0));
            setPageNo(Number(data?.pageNo ?? currentPageNo));
            setPageSize(Number(data?.pageSize ?? currentPageSize));
        } catch (error) {
            message.error('加载商品失败: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // 加载统计信息
    const loadStatistics = async () => {
        try {
            const response = await requestWithAuth(`${API_BASE}/statistics`);
            const data = (await response.json()) as Stats;
            setStats(data);
        } catch (error) {
            console.error('加载统计信息失败:', error);
        }
    };

    const loadWarehousesAndPositions = async () => {
        try {
            const [storesRes, positionsRes] = await Promise.all([
                requestWithAuth(`${API_BASE}/stores`),
                requestWithAuth(`${API_BASE}/positions`)
            ]);

            if (storesRes.ok) {
                const storesData = await storesRes.json();
                if (Array.isArray(storesData)) {
                    setWarehouseOptions(
                        storesData.map((item: Record<string, unknown>) => ({
                            id: Number(item.id),
                            code: String(item.code || ''),
                            name: String(item.name || ''),
                            status: String(item.status || '1')
                        }))
                    );
                }
            }

            if (positionsRes.ok) {
                const positionsData = await positionsRes.json();
                const rawPositions = Array.isArray(positionsData)
                    ? positionsData
                    : Array.isArray(positionsData?.data)
                        ? positionsData.data
                        : null;
                if (rawPositions) {
                    setPositionOptions(
                        rawPositions.map((item: Record<string, unknown>) => {
                            const rawParent = item.parentId ?? item.parent_id;
                            return {
                                id: Number(item.id),
                                warehouseId: Number(item.warehouseId ?? item.warehouse_id),
                                parentId:
                                    rawParent == null || rawParent === ''
                                        ? null
                                        : Number(rawParent),
                                code: String(item.code || ''),
                                name: item.name ? String(item.name) : '',
                                status: item.status ? String(item.status) : '1',
                                type: item.type ? String(item.type) : 'area',
                                maxCapacity: Number(item.maxCapacity ?? item.max_capacity ?? 0),
                                unit: item.unit ? String(item.unit) : undefined,
                            };
                        })
                    );
                }
            }
        } catch (error) {
            console.warn('加载仓库/仓位失败，已回退 mock 数据', error);
            setWarehouseOptions(storeList as unknown as StoreItem[]);
            setPositionOptions(positionList as unknown as PositionNodeItem[]);
        }
    };

    // 打开添加商品模态框
    const openAddModal = () => {
        console.log('openAddModal');
        setCurrentProductId(null);
        // productForm.resetFields();
        setProductModalVisible(true);
    };

    // 打开编辑商品模态框
    const openEditModal = (productId: string | number) => {
        setCurrentProductId(String(productId));
        setProductModalVisible(true);
    };

    // 删除商品（Spring 的 Result 失败时仍可能 HTTP 200，必须判断 success）
    const handleDelete = async (productId: string | number) => {
        try {
            const response = await requestWithAuth(`${API_BASE}/product?id=${encodeURIComponent(productId)}`, {
                method: 'DELETE'
            });
            let result: { success?: boolean; message?: string } = {};
            try {
                result = (await response.json()) as { success?: boolean; message?: string };
            } catch {
                message.error('删除接口返回非 JSON，无法解析');
                return;
            }
            if (!response.ok) {
                message.error(result.message || `删除失败（${response.status}）`);
                return;
            }
            if (result.success === false) {
                message.error(result.message || '删除失败');
                return;
            }
            try {
                localStorage.removeItem(`product_default_loc:${String(productId)}`);
            } catch {
                /* 忽略本地偏好清理失败 */
            }
            message.success(result.message || '商品删除成功');
            loadProducts();
            loadStatistics();
        } catch (error) {
            message.error('删除商品失败: ' + (error as Error).message);
        }
    };

    // 打开入库/出库模态框
    const openStockModal = async (productId: string | number, type: StockType) => {
        try {
            const response = await requestWithAuth(`${API_BASE}/product?id=${encodeURIComponent(String(productId))}`);
            if (!response.ok) {
                message.error('获取商品信息失败');
                return;
            }
            const product = (await response.json()) as ProductItem;
            setCurrentProductId(String(productId));
            setCurrentStockType(type);
            setCurrentProduct(product);
            setStockModalVisible(true);
        } catch (error) {
            message.error('获取商品信息失败: ' + (error as Error).message);
        }
    };

    // 搜索商品：仅此时把输入同步为已应用条件并请求接口
    const handleSearch = () => {
        const kw = searchInput.trim();
        setAppliedSearch(kw);
        setPageNo(1);
        void loadProducts({ nameQuery: kw, pageNo: 1, pageSize });
    };

    // 重置：清空名称条件，重新请求全量列表
    const handleReset = () => {
        setSearchInput('');
        setAppliedSearch('');
        setPageNo(1);
        void loadProducts({ nameQuery: '', pageNo: 1, pageSize });
    };

    const handlePageChange = (nextPageNo: number, nextPageSize: number) => {
        void loadProducts({ pageNo: nextPageNo, pageSize: nextPageSize });
    };

    const openInventory = (record: ProductItem) => {
        setInventoryProduct(record);
        setInventoryDrawerVisible(true);
    };

    const handleInventoryAdjust = () => {
        void loadProducts();
        loadStatistics();
    };

    // 表格列定义
    const columns: ColumnsType<ProductItem> = [
        {
            title: '商品ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 120,
        },
        {
            title: '商品名称',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            align: 'center',
        },
        {
            title: '类别',
            dataIndex: 'category',
            key: 'category',
            width: 150,
            align: 'center',
            render: (category: string) => <Tag color="blue">{category}</Tag>,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 90,
            align: 'center',
            render: (status: number | undefined) => (
                <Tag color={(status ?? 1) === 1 ? 'green' : 'default'}>
                    {(status ?? 1) === 1 ? '上架' : '下架'}
                </Tag>
            ),
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            align: 'center',
            render: (price: number) => `¥${Number(price || 0).toFixed(2)}`,
        },
        {
            title: '数量',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            align: 'center',
            render: (quantity: number) => <span style={{ fontWeight: 'bold' }}>{quantity}</span>,
        },
        {
            title: '总价值',
            dataIndex: 'totalValue',
            key: 'totalValue',
            width: 120,
            align: 'center',
            render: (_: number | undefined, record) =>
                `¥${Number(record.totalValue ?? (record.price * record.quantity)).toFixed(2)}`,
        },
        {
            title: '操作',
            key: 'action',
            width: 340,
            align: 'center',
            render: (_, record: ProductItem) => (
                <Space size="small">
                    {canEdit && (
                        <Button type="link" size="small" onClick={() => openEditModal(record.id)}>
                            编辑
                        </Button>
                    )}
                    {canViewDetail && (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => openInventory(record)}
                        >
                            库存
                        </Button>
                    )}
                    {canDelete && (
                        <Popconfirm
                            title="确定要删除这个商品吗？"
                            description={
                                (record.quantity ?? 0) > 0
                                    ? '当前商品仍有库存数量，确认后将自动清除各仓库库存明细、库存流水并删除商品主数据，操作不可恢复。'
                                    : '删除后不可恢复。'
                            }
                            onConfirm={() => handleDelete(record.id)}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Button type="link" size="small" danger>
                                删除
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* 头部统计卡片 */}
            <Card style={{ marginBottom: 24, background: '#13c2c2' }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Statistic
                            title="商品总数"
                            value={stats.productCount}
                            style={{ color: '#fff' }}
                            prefix={<span style={{ fontSize: 24 }}>📦</span>}
                        />
                    </Col>
                    <Col span={12}>
                        <Statistic
                            title="库存总价值"
                            value={stats.totalValue}
                            precision={2}
                            prefix={<span style={{ fontSize: 24 }}>💰</span>}
                            style={{ color: '#fff' }}
                        />
                    </Col>
                </Row>
            </Card>

            {/* 操作栏和表格 */}
            <Card>
                <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Space>
                        <Input
                            placeholder="搜索商品名称..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onPressEnter={handleSearch}
                            style={{ width: 200 }}
                            allowClear
                        />
                        <Button type="primary" onClick={handleSearch}>
                            搜索
                        </Button>
                        <Button onClick={handleReset}>
                            重置
                        </Button>
                    </Space>
                    <Space>
                        {canAdd && (
                            <Button variant='outlined' onClick={openAddModal}>
                                ➕ 添加商品
                            </Button>
                        )}
                        <Button onClick={() => { loadProducts(); loadStatistics(); message.success('数据已刷新'); }}>
                            🔄 刷新
                        </Button>
                        {canViewStatistics && (
                            <Button onClick={() => setStatisticsModalVisible(true)}>
                                📊 统计信息
                            </Button>
                        )}
                        {canViewLowStock && (
                            <Button onClick={() => setLowStockModalVisible(true)}>
                                ⚠️ 低库存预警
                            </Button>
                        )}
                    </Space>
                </Space>

                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pageNo,
                        pageSize,
                        total,
                        showSizeChanger: true,
                        onChange: handlePageChange,
                        showTotal: (total) => `共 ${total} 条记录`,
                    }}
                />
            </Card>
            
            {/* 添加/编辑商品模态框 */}
            <AddProductModal
                currentProductId={currentProductId ?? undefined}
                visible={productModalVisible}
                warehouseList={warehouseOptions as unknown as import('../types/inventory').StoreItem[]}
                positionTree={positionOptions as unknown as import('../types/inventory').PositionItem[]}
                onClose={
                    () => {
                        setProductModalVisible(false);
                        setCurrentProductId(null);
                        productForm.resetFields();
                    }
                }
                onSuccess={() => {
                    loadProducts();
                    loadStatistics();
                }}
            ></AddProductModal>

            {/* 入库/出库模态框 */}
            <OutOrInStockModal
                stockModalVisible={stockModalVisible}
                currentStockType={currentStockType}
                currentProduct={currentProduct}
                warehouseList={warehouseOptions}
                positionList={positionOptions as unknown as import('../types/inventory').PositionItem[]}
                onClose={() => {
                    setStockModalVisible(false);
                }}
                onSuccess={() => {
                    loadProducts();
                    loadStatistics();
                }}
            />

            {/* 统计信息模态框 */}
            <StatisticsModal
                visible={statisticsModalVisible}
                onClose={() => setStatisticsModalVisible(false)}
                stats={stats}
            />

            {/* 低库存预警模态框 */}
            <LowStockModal
                visible={lowStockModalVisible}
                onClose={() => setLowStockModalVisible(false)}
                onOpenStockIn={async (record) => {
                    setLowStockModalVisible(false);
                    await openStockModal(record.id, 'in');
                }}
                onOpenInventory={(record) => {
                    setLowStockModalVisible(false);
                    setInventoryProduct(record);
                    setInventoryDrawerVisible(true);
                }}
            />

            {/* 库存抽屉 */}
            <InventoryDrawer
                visible={inventoryDrawerVisible}
                onClose={() => setInventoryDrawerVisible(false)}
                product={inventoryProduct}
                warehouseList={warehouseOptions as unknown as import('../types/inventory').StoreItem[]}
                positionList={positionOptions as unknown as import('../types/inventory').PositionItem[]}
                onAdjust={handleInventoryAdjust}
                onProductUpdated={handleInventoryAdjust}
            />
        </div>
    );
}

export default ProductManagement;
