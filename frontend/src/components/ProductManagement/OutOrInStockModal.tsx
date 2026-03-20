import React, { useEffect } from 'react';
import { Modal, Button, InputNumber, Form, Space, message } from 'antd';
import { authFetch } from '../../auth';
import type { ProductItem } from '../../types/inventory';

const API_BASE = '/api';

type StockType = 'in' | 'out';

interface OutOrInStockModalProps {
    stockModalVisible?: boolean;
    currentStockType?: StockType;
    onClose?: () => void;
    currentProduct?: ProductItem | null;
    onSuccess?: () => void;
}

interface StockFormValues {
    amount: number;
}

function OutOrInStockModal(props: OutOrInStockModalProps): JSX.Element {
    const [stockForm] = Form.useForm<StockFormValues>();
    const {
        stockModalVisible = false,
        currentStockType = 'in',
        onClose = () => {},
        currentProduct = null,
        onSuccess,
    } = props;

    useEffect(() => {
        stockForm.resetFields();
    }, [currentStockType, stockForm]);

    const handleStockSubmit = async (values: StockFormValues) => {
        if (!currentProduct) return;
        const endpoint = currentStockType === 'in' ? 'stock-in' : 'stock-out';
        try {
            const response = await authFetch(`${API_BASE}/${endpoint}`, {
                method: 'POST',
                body: JSON.stringify({ id: currentProduct.id, amount: values.amount }),
            });
            const result = await response.json();
            if (response.ok) {
                message.success(result.message || '操作成功');
                onClose();
                stockForm.resetFields();
                onSuccess?.();
            } else {
                message.error(result.message || '操作失败');
            }
        } catch (error) {
            message.error('操作失败: ' + (error as Error).message);
        }
    };

    return (
        <Modal
            title={currentStockType === 'in' ? '商品入库' : '商品出库'}
            open={stockModalVisible}
            onCancel={onClose}
            footer={null}
            width={500}
        >
            {currentProduct && (
                <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                    <div><strong>商品ID:</strong> {currentProduct.id}</div>
                    <div><strong>商品名称:</strong> {currentProduct.name}</div>
                    <div><strong>当前库存:</strong> {currentProduct.quantity}</div>
                    <div><strong>价格:</strong> ¥{Number(currentProduct.price || 0).toFixed(2)}</div>
                </div>
            )}
            <Form form={stockForm} layout="vertical" onFinish={handleStockSubmit}>
                <Form.Item
                    label={currentStockType === 'in' ? '入库数量' : '出库数量'}
                    name="amount"
                    rules={[
                        { required: true, message: `请输入${currentStockType === 'in' ? '入库' : '出库'}数量` },
                        { type: 'number', min: 1, message: '数量必须大于0' },
                        {
                            validator: (_, value: number) => {
                                if (currentStockType === 'out' && currentProduct && value > currentProduct.quantity) {
                                    return Promise.reject(new Error('出库数量不能超过当前库存'));
                                }
                                return Promise.resolve();
                            },
                        },
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
                        <Button onClick={onClose}>取消</Button>
                        <Button type="primary" htmlType="submit">确认</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default OutOrInStockModal;
