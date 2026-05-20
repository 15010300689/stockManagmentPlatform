import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, InputNumber, Form, Space, message, Select, TreeSelect, Input } from 'antd';
import { requestWithAuth } from '../../api/client';
import type { ProductItem, StoreItem, PositionItem } from '../../types/inventory';
import { buildPositionTree } from '../../utils/positionTree';

const API_BASE = '/api';

type StockType = 'in' | 'out';

interface OutOrInStockModalProps {
    stockModalVisible?: boolean;
    currentStockType?: StockType;
    onClose?: () => void;
    currentProduct?: ProductItem | null;
    warehouseList?: StoreItem[];
    positionList?: PositionItem[];
    onSuccess?: () => void;
}

interface StockFormValues {
    warehouseId: number;
    positionId?: number;
    amount: number;
    remark?: string;
}

interface PositionStockRow {
    positionId?: number | null;
    quantity: number;
}

function OutOrInStockModal(props: OutOrInStockModalProps): JSX.Element {
    const [stockForm] = Form.useForm<StockFormValues>();
    const {
        stockModalVisible = false,
        currentStockType = 'in',
        onClose = () => {},
        currentProduct = null,
        warehouseList = [],
        positionList = [],
        onSuccess,
    } = props;

    const warehouseId = Form.useWatch('warehouseId', stockForm);
    const positionId = Form.useWatch('positionId', stockForm);
    const [locationStock, setLocationStock] = useState<number | null>(null);

    const warehouseOptions = useMemo(
        () =>
            warehouseList.map((item) => ({
                label: item.name,
                value: item.id,
                disabled: item.status !== '1',
            })),
        [warehouseList]
    );

    const positionTree = useMemo(
        () => buildPositionTree(positionList, warehouseId),
        [positionList, warehouseId]
    );

    useEffect(() => {
        if (!stockModalVisible) {
            return;
        }
        stockForm.resetFields();
        setLocationStock(null);
    }, [currentStockType, stockModalVisible, stockForm]);

    useEffect(() => {
        const loadLocationStock = async () => {
            if (currentStockType !== 'out' || !currentProduct?.id || !warehouseId) {
                setLocationStock(null);
                return;
            }
            try {
                const params = new URLSearchParams({
                    productId: String(currentProduct.id),
                    warehouseId: String(warehouseId),
                });
                const response = await requestWithAuth(
                    `${API_BASE}/inventory/positions?${params.toString()}`
                );
                if (!response.ok) {
                    setLocationStock(null);
                    return;
                }
                const rows = (await response.json()) as PositionStockRow[];
                if (!Array.isArray(rows)) {
                    setLocationStock(null);
                    return;
                }
                if (positionId != null) {
                    const row = rows.find((r) => r.positionId === positionId);
                    setLocationStock(row?.quantity ?? 0);
                } else {
                    const whLevel = rows.find((r) => r.positionId == null);
                    setLocationStock(whLevel?.quantity ?? 0);
                }
            } catch {
                setLocationStock(null);
            }
        };
        void loadLocationStock();
    }, [currentStockType, currentProduct?.id, warehouseId, positionId]);

    const handleStockSubmit = async (values: StockFormValues) => {
        if (!currentProduct) return;
        const endpoint = currentStockType === 'in' ? 'stock-in' : 'stock-out';
        try {
            const response = await requestWithAuth(`${API_BASE}/${endpoint}`, {
                method: 'POST',
                body: JSON.stringify({
                    id: Number(currentProduct.id),
                    warehouseId: values.warehouseId,
                    positionId: values.positionId ?? null,
                    amount: values.amount,
                    remark: values.remark || '',
                }),
            });
            const result = await response.json();
            if (response.ok && result.success !== false) {
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

    const maxOut =
        currentStockType === 'out' && locationStock != null
            ? locationStock
            : currentStockType === 'out' && currentProduct
                ? currentProduct.quantity
                : undefined;

    return (
        <Modal
            title={currentStockType === 'in' ? '商品入库' : '商品出库'}
            open={stockModalVisible}
            onCancel={onClose}
            footer={null}
            width={560}
            destroyOnHidden
        >
            {currentProduct && (
                <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                    <div><strong>商品ID:</strong> {currentProduct.id}</div>
                    <div><strong>商品名称:</strong> {currentProduct.name}</div>
                    <div><strong>总库存:</strong> {currentProduct.quantity}</div>
                    {currentStockType === 'out' && locationStock != null && warehouseId && (
                        <div>
                            <strong>当前库位可出:</strong> {locationStock}
                        </div>
                    )}
                </div>
            )}
            <Form form={stockForm} layout="vertical" onFinish={handleStockSubmit}>
                <Form.Item
                    label="仓库"
                    name="warehouseId"
                    rules={[{ required: true, message: '请选择仓库' }]}
                >
                    <Select
                        placeholder="请选择仓库"
                        options={warehouseOptions}
                        onChange={() => stockForm.setFieldValue('positionId', undefined)}
                    />
                </Form.Item>
                <Form.Item
                    label="仓位"
                    name="positionId"
                    extra={
                        currentStockType === 'out'
                            ? '出库请选有库存的仓位；不选则仅从仓库级库存扣减'
                            : '可选；不选则记为仓库级库存'
                    }
                >
                    <TreeSelect
                        placeholder="可选，精确到仓位"
                        treeData={positionTree}
                        disabled={!warehouseId}
                        allowClear
                        treeDefaultExpandAll
                        fieldNames={{ label: 'title', value: 'value', children: 'children' }}
                    />
                </Form.Item>
                <Form.Item
                    label={currentStockType === 'in' ? '入库数量' : '出库数量'}
                    name="amount"
                    rules={[
                        {
                            required: true,
                            message: `请输入${currentStockType === 'in' ? '入库' : '出库'}数量`,
                        },
                        { type: 'number', min: 1, message: '数量必须大于0' },
                        {
                            validator: (_, value: number) => {
                                if (
                                    currentStockType === 'out' &&
                                    maxOut != null &&
                                    value > maxOut
                                ) {
                                    return Promise.reject(
                                        new Error(`出库数量不能超过当前库位库存（${maxOut}）`)
                                    );
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={1}
                        max={maxOut}
                        placeholder={`请输入${currentStockType === 'in' ? '入库' : '出库'}数量`}
                    />
                </Form.Item>
                <Form.Item label="备注" name="remark">
                    <Input.TextArea rows={2} placeholder="可填写单号、原因等" />
                </Form.Item>
                <Form.Item>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={onClose}>取消</Button>
                        <Button type="primary" htmlType="submit">
                            确认
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default OutOrInStockModal;
