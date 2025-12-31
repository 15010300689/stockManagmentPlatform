import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    message,
    Space,
    Card,
    Statistic,
    Row,
    Col,
    Tag,
    Popconfirm
} from 'antd';
import { authFetch } from '../auth';
import StatisticsModal from '../components/StatisticsModal';
import LowStockModal from '../components/LowStockModal';

const API_BASE = '/api';

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ productCount: 0, totalValue: 0, categories: [] });
    const [searchKeyword, setSearchKeyword] = useState('');

    // 模态框状态
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [stockModalVisible, setStockModalVisible] = useState(false);
    const [statisticsModalVisible, setStatisticsModalVisible] = useState(false);
    const [lowStockModalVisible, setLowStockModalVisible] = useState(false);

    // 表单实例
    const [productForm] = Form.useForm();
    const [stockForm] = Form.useForm();

    // 当前操作的商品ID和类型
    const [currentProductId, setCurrentProductId] = useState(null);
    const [currentStockType, setCurrentStockType] = useState('in');
    const [currentProduct, setCurrentProduct] = useState(null);

    // 组件挂载时加载数据
    useEffect(() => {
        loadProducts();
        loadStatistics();
    }, []);

    // 加载商品列表
    const loadProducts = async () => {
        setLoading(true);
        try {
            const url = searchKeyword
                ? `${API_BASE}/products?name=${encodeURIComponent(searchKeyword)}`
                : `${API_BASE}/products`;
            const response = await authFetch(url);
            const data = await response.json();
            setProducts(data || []);
        } catch (error) {
            message.error('加载商品失败: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // 加载统计信息
    const loadStatistics = async () => {
        try {
            const response = await authFetch(`${API_BASE}/statistics`);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('加载统计信息失败:', error);
        }
    };

    // 打开添加商品模态框
    const openAddModal = () => {
        setCurrentProductId(null);
        productForm.resetFields();
        setProductModalVisible(true);
    };

    // 打开编辑商品模态框
    const openEditModal = async (productId) => {
        try {
            const response = await authFetch(`${API_BASE}/product?id=${encodeURIComponent(productId)}`);
            if (!response.ok) {
                message.error('获取商品信息失败');
                return;
            }
            const product = await response.json();
            setCurrentProductId(productId);
            productForm.setFieldsValue({
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                quantity: product.quantity
            });
            setProductModalVisible(true);
        } catch (error) {
            message.error('获取商品信息失败: ' + error.message);
        }
    };

    // 提交商品表单
    const handleProductSubmit = async (values) => {
        try {
            if (currentProductId) {
                // 更新商品
                const response = await authFetch(`${API_BASE}/product?id=${encodeURIComponent(currentProductId)}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        name: values.name,
                        price: values.price,
                        category: values.category
                    })
                });
                const result = await response.json();
                if (response.ok) {
                    message.success('商品更新成功');
                    setProductModalVisible(false);
                    loadProducts();
                    loadStatistics();
                } else {
                    message.error(result.message || '更新失败');
                }
            } else {
                // 添加商品
                const response = await authFetch(`${API_BASE}/products`, {
                    method: 'POST',
                    body: JSON.stringify(values)
                });
                const result = await response.json();
                if (response.ok) {
                    message.success('商品添加成功');
                    setProductModalVisible(false);
                    loadProducts();
                    loadStatistics();
                } else {
                    message.error(result.message || '添加失败');
                }
            }
        } catch (error) {
            message.error('操作失败: ' + error.message);
        }
    };

    // 删除商品
    const handleDelete = async (productId) => {
        try {
            const response = await authFetch(`${API_BASE}/product?id=${encodeURIComponent(productId)}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (response.ok) {
                message.success('商品删除成功');
                loadProducts();
                loadStatistics();
            } else {
                message.error(result.message || '删除失败');
            }
        } catch (error) {
            message.error('删除商品失败: ' + error.message);
        }
    };

    // 打开入库/出库模态框
    const openStockModal = async (productId, type) => {
        try {
            const response = await authFetch(`${API_BASE}/product?id=${encodeURIComponent(productId)}`);
            if (!response.ok) {
                message.error('获取商品信息失败');
                return;
            }
            const product = await response.json();
            setCurrentProductId(productId);
            setCurrentStockType(type);
            setCurrentProduct(product);
            stockForm.resetFields();
            setStockModalVisible(true);
        } catch (error) {
            message.error('获取商品信息失败: ' + error.message);
        }
    };

    // 提交入库/出库
    const handleStockSubmit = async (values) => {
        const endpoint = currentStockType === 'in' ? 'stock-in' : 'stock-out';
        try {
            const response = await authFetch(`${API_BASE}/${endpoint}`, {
                method: 'POST',
                body: JSON.stringify({
                    id: currentProductId,
                    amount: values.amount
                })
            });
            const result = await response.json();
            if (response.ok) {
                message.success(result.message || '操作成功');
                setStockModalVisible(false);
                loadProducts();
                loadStatistics();
            } else {
                message.error(result.message || '操作失败');
            }
        } catch (error) {
            message.error('操作失败: ' + error.message);
        }
    };

    // 搜索商品
    const handleSearch = () => {
        loadProducts();
    };

    // 表格列定义
    const columns = [
        {
            title: '商品ID',
            dataIndex: 'id',
            key: 'id',
            width: 120,
        },
        {
            title: '商品名称',
            dataIndex: 'name',
            key: 'name',
            width: 200,
        },
        {
            title: '类别',
            dataIndex: 'category',
            key: 'category',
            width: 150,
            render: (category) => <Tag color="blue">{category}</Tag>,
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price) => `¥${price.toFixed(2)}`,
        },
        {
            title: '数量',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            render: (quantity) => <span style={{ fontWeight: 'bold' }}>{quantity}</span>,
        },
        {
            title: '总价值',
            dataIndex: 'totalValue',
            key: 'totalValue',
            width: 120,
            render: (value) => `¥${value.toFixed(2)}`,
        },
        {
            title: '操作',
            key: 'action',
            width: 280,
            render: (_, record) => (
                <Space size="small">
                    <Button type="link" size="small" onClick={() => openEditModal(record.id)}>
                        编辑
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        style={{ color: '#52c41a' }}
                        onClick={() => openStockModal(record.id, 'in')}
                    >
                        入库
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        style={{ color: '#1890ff' }}
                        onClick={() => openStockModal(record.id, 'out')}
                    >
                        出库
                    </Button>
                    <Popconfirm
                        title="确定要删除这个商品吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" size="small" danger>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* 头部统计卡片 */}
            <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Statistic
                            title="商品总数"
                            value={stats.productCount}
                            valueStyle={{ color: '#fff' }}
                            prefix={<span style={{ fontSize: 24 }}>📦</span>}
                        />
                    </Col>
                    <Col span={12}>
                        <Statistic
                            title="库存总价值"
                            value={stats.totalValue}
                            precision={2}
                            prefix={<span style={{ fontSize: 24 }}>💰</span>}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Col>
                </Row>
            </Card>

            {/* 操作栏和表格 */}
            <Card>
                <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Space>
                        <Button type="primary" onClick={openAddModal}>
                            ➕ 添加商品
                        </Button>
                        <Button onClick={() => { loadProducts(); loadStatistics(); message.success('数据已刷新'); }}>
                            🔄 刷新
                        </Button>
                        <Button onClick={() => setStatisticsModalVisible(true)}>
                            📊 统计信息
                        </Button>
                        <Button onClick={() => setLowStockModalVisible(true)}>
                            ⚠️ 低库存预警
                        </Button>
                    </Space>
                    <Space>
                        <Input
                            placeholder="搜索商品名称..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onPressEnter={handleSearch}
                            style={{ width: 200 }}
                            allowClear
                        />
                        <Button type="primary" onClick={handleSearch}>
                            搜索
                        </Button>
                    </Space>
                </Space>

                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                    }}
                />
            </Card>

            {/* 添加/编辑商品模态框 */}
            <Modal
                title={currentProductId ? '编辑商品' : '添加商品'}
                visible={productModalVisible}
                onCancel={() => {
                    setProductModalVisible(false);
                    productForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={productForm}
                    layout="vertical"
                    onFinish={handleProductSubmit}
                >
                    <Form.Item
                        label="商品ID"
                        name="id"
                        rules={[{ required: true, message: '请输入商品ID' }]}
                    >
                        <Input disabled={!!currentProductId} placeholder="请输入商品ID" />
                    </Form.Item>
                    <Form.Item
                        label="商品名称"
                        name="name"
                        rules={[{ required: true, message: '请输入商品名称' }]}
                    >
                        <Input placeholder="请输入商品名称" />
                    </Form.Item>
                    <Form.Item
                        label="类别"
                        name="category"
                        rules={[{ required: true, message: '请输入类别' }]}
                    >
                        <Input placeholder="请输入类别" />
                    </Form.Item>
                    <Form.Item
                        label="价格 (¥)"
                        name="price"
                        rules={[{ required: true, message: '请输入价格' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={0.01}
                            precision={2}
                            placeholder="请输入价格"
                        />
                    </Form.Item>
                    {!currentProductId && (
                        <Form.Item
                            label="数量"
                            name="quantity"
                            rules={[{ required: true, message: '请输入数量' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                placeholder="请输入数量"
                            />
                        </Form.Item>
                    )}
                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setProductModalVisible(false);
                                productForm.resetFields();
                            }}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                保存
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 入库/出库模态框 */}
            <Modal
                title={currentStockType === 'in' ? '商品入库' : '商品出库'}
                visible={stockModalVisible}
                onCancel={() => {
                    setStockModalVisible(false);
                    stockForm.resetFields();
                }}
                footer={null}
                width={500}
            >
                {currentProduct && (
                    <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                        <div><strong>商品ID:</strong> {currentProduct.id}</div>
                        <div><strong>商品名称:</strong> {currentProduct.name}</div>
                        <div><strong>当前库存:</strong> {currentProduct.quantity}</div>
                        <div><strong>价格:</strong> ¥{currentProduct.price.toFixed(2)}</div>
                    </div>
                )}
                <Form
                    form={stockForm}
                    layout="vertical"
                    onFinish={handleStockSubmit}
                >
                    <Form.Item
                        label={currentStockType === 'in' ? '入库数量' : '出库数量'}
                        name="amount"
                        rules={[
                            { required: true, message: `请输入${currentStockType === 'in' ? '入库' : '出库'}数量` },
                            {
                                type: 'number',
                                min: 1,
                                message: '数量必须大于0'
                            },
                            currentStockType === 'out' && currentProduct ? {
                                validator: (_, value) => {
                                    if (value > currentProduct.quantity) {
                                        return Promise.reject(new Error('出库数量不能超过当前库存'));
                                    }
                                    return Promise.resolve();
                                }
                            } : {}
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={1}
                            max={currentStockType === 'out' && currentProduct ? currentProduct.quantity : undefined}
                            placeholder={`请输入${currentStockType === 'in' ? '入库' : '出库'}数量`}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setStockModalVisible(false);
                                stockForm.resetFields();
                            }}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                确认
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

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
            />
        </div>
    );
}

export default ProductManagement;

