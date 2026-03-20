import React, { useState } from 'react';
import { Modal, Button, Table, InputNumber, Space, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { authFetch } from '../../auth';

import { mockLowStockProducts } from '../../mock/productManagement';
import type { ProductItem } from '../../types/inventory';

const API_BASE = '/api';

interface LowStockModalProps {
    visible: boolean;
    onClose: () => void;
}

function LowStockModal({ visible, onClose }: LowStockModalProps): JSX.Element {
    const [threshold, setThreshold] = useState(10);
    const [products, setProducts] = useState<ProductItem[]>(mockLowStockProducts || []);
    const [loading, setLoading] = useState(false);

    const checkLowStock = async () => {
        setLoading(true);
        try {
            const response = await authFetch(`${API_BASE}/low-stock?threshold=${threshold}`);
            const data = await response.json();
            setProducts(data || []);
        } catch (error) {
            message.error('查询低库存商品失败: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<ProductItem> = [
        {
            title: '商品ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: '商品名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '类别',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => <Tag color="blue">{category}</Tag>,
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `¥${price.toFixed(2)}`,
        },
        {
            title: '数量',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number) => <Tag color="red">{quantity}</Tag>,
        },
    ];

    return (
        <Modal
            title="⚠️ 低库存预警"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    关闭
                </Button>
            ]}
            width={800}
        >
            <Space style={{ marginBottom: 16 }}>
                <span>库存阈值:</span>
                <InputNumber
                    value={threshold}
                    onChange={(value) => setThreshold(value ?? 10)}
                    min={1}
                />
                <Button type="primary" onClick={checkLowStock} loading={loading}>
                    查询
                </Button>
            </Space>
            <Table<ProductItem>
                columns={columns}
                dataSource={products}
                rowKey="id"
                loading={loading}
                pagination={false}
                locale={{
                    emptyText: `没有库存低于 ${threshold} 的商品`
                }}
            />
        </Modal>
    );
}

export default LowStockModal;
