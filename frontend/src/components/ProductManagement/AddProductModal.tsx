import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Button, Input, InputNumber, Form, Space, Select, TreeSelect, Switch, message } from 'antd';
import { currencyConfig } from '../../config/currencyConfig';
import { unitConfig } from '../../config/unitConfig';
import { requestWithAuth } from '../../api/client';
import { buildPositionTree } from '../../utils/positionTree';
import type { PositionItem, StoreItem } from '../../types/inventory';

const API_BASE = '/api';

const PREFS_PREFIX = 'product_default_loc:';

interface AddProductModalProps {
    currentProductId?: string;
    visible?: boolean;
    warehouseList?: StoreItem[];
    positionTree?: PositionItem[];
    onClose: () => void;
    onSuccess?: () => void;
}

interface ProductFormValues {
    name: string;
    category: string;
    currency?: string;
    unit?: string;
    price: number;
    safeStock?: number;
    status: boolean;
    defaultWarehouseId?: number;
    defaultPositionId?: number;
}

interface ApiProduct {
    id: string | number;
    name: string;
    category?: string;
    price: number;
    quantity?: number;
    safeStock?: number;
    status?: number;
}

interface ApiResult {
    success?: boolean;
    message?: string;
    data?: ApiProduct;
}

function readLocationPrefs(productId: string): { defaultWarehouseId?: number; defaultPositionId?: number } {
    try {
        const raw = localStorage.getItem(PREFS_PREFIX + productId);
        if (!raw) return {};
        return JSON.parse(raw) as { defaultWarehouseId?: number; defaultPositionId?: number };
    } catch {
        return {};
    }
}

function writeLocationPrefs(productId: string, warehouseId?: number, positionId?: number) {
    if (!productId) return;
    localStorage.setItem(
        PREFS_PREFIX + productId,
        JSON.stringify({ defaultWarehouseId: warehouseId, defaultPositionId: positionId })
    );
}

function mapPositionRow(item: Record<string, unknown>): PositionItem | null {
    const id = item.id != null ? Number(item.id) : NaN;
    const warehouseId = Number(item.warehouseId ?? item.warehouse_id);
    if (Number.isNaN(id) || Number.isNaN(warehouseId)) {
        return null;
    }
    const rawParent = item.parentId ?? item.parent_id;
    return {
        id,
        warehouseId,
        parentId: rawParent == null || rawParent === '' ? null : Number(rawParent),
        code: String(item.code || ''),
        name: item.name ? String(item.name) : '',
        status: String(item.status ?? '1'),
        type: String(item.type || 'area'),
        maxCapacity: Number(item.maxCapacity ?? item.max_capacity ?? 0),
        unit: item.unit ? String(item.unit) : undefined,
    };
}

function parsePositionList(payload: unknown): PositionItem[] {
    const rawList = Array.isArray(payload)
        ? payload
        : payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)
            ? (payload as { data: Record<string, unknown>[] }).data
            : [];
    return rawList
        .map((row) => mapPositionRow(row as Record<string, unknown>))
        .filter((item): item is PositionItem => item != null);
}

function AddProductModal(props: AddProductModalProps): JSX.Element {
    const [form] = Form.useForm<ProductFormValues>();
    const {
        currentProductId = '',
        visible = false,
        warehouseList = [],
        positionTree = [],
        onSuccess,
    } = props;

    const [positionsForWarehouse, setPositionsForWarehouse] = useState<PositionItem[]>([]);
    const [positionsLoading, setPositionsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const selectedWarehouse = Form.useWatch('defaultWarehouseId', form);

    const loadPositionsByWarehouse = useCallback(async (warehouseId: number) => {
        setPositionsLoading(true);
        try {
            const res = await requestWithAuth(
                `${API_BASE}/positions?warehouseId=${encodeURIComponent(String(warehouseId))}`
            );
            const payload = await res.json();
            if (!res.ok) {
                message.error((payload as ApiResult)?.message || '加载仓位列表失败');
                setPositionsForWarehouse([]);
                return;
            }
            setPositionsForWarehouse(parsePositionList(payload));
        } catch (e) {
            message.error('加载仓位列表失败: ' + (e as Error).message);
            setPositionsForWarehouse([]);
        } finally {
            setPositionsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!visible || !selectedWarehouse) {
            setPositionsForWarehouse([]);
            return;
        }
        void loadPositionsByWarehouse(Number(selectedWarehouse));
    }, [visible, selectedWarehouse, loadPositionsByWarehouse]);

    const positionTreeData = useMemo(() => {
        if (!selectedWarehouse) {
            return [];
        }
        const whId = Number(selectedWarehouse);
        const source =
            positionsForWarehouse.length > 0
                ? positionsForWarehouse
                : positionTree.filter((item) => Number(item.warehouseId) === whId);
        return buildPositionTree(source, whId);
    }, [selectedWarehouse, positionsForWarehouse, positionTree]);

    const loadProductDetail = useCallback(async () => {
        if (!visible || !currentProductId) return;
        setDetailLoading(true);
        try {
            const res = await requestWithAuth(`${API_BASE}/product?id=${encodeURIComponent(currentProductId)}`);
            const data = await res.json();
            if (!res.ok) {
                message.error((data as ApiResult).message || '获取商品失败');
                return;
            }
            const p = data as ApiProduct;
            const prefs = readLocationPrefs(String(p.id));
            form.setFieldsValue({
                name: p.name,
                category: p.category || '',
                price: Number(p.price),
                safeStock: p.safeStock != null ? Number(p.safeStock) : undefined,
                status: (p.status ?? 1) === 1,
                defaultWarehouseId: prefs.defaultWarehouseId,
                defaultPositionId: prefs.defaultPositionId,
            });
        } catch (e) {
            message.error('获取商品失败: ' + (e as Error).message);
        } finally {
            setDetailLoading(false);
        }
    }, [visible, currentProductId, form]);

    useEffect(() => {
        if (!visible) {
            form.resetFields();
            setPositionsForWarehouse([]);
            return;
        }
        if (currentProductId) {
            void loadProductDetail();
        } else {
            form.resetFields();
            form.setFieldsValue({ status: true });
            setPositionsForWarehouse([]);
        }
    }, [visible, currentProductId, form, loadProductDetail]);

    const onFinish = async (values: ProductFormValues) => {
        const body = {
            name: values.name.trim(),
            category: values.category?.trim() || null,
            price: values.price,
            safeStock: values.safeStock != null && values.safeStock !== undefined ? values.safeStock : null,
            status: values.status ? 1 : 0,
        };

        setSubmitting(true);
        try {
            if (currentProductId) {
                const res = await requestWithAuth(`${API_BASE}/product?id=${encodeURIComponent(currentProductId)}`, {
                    method: 'PUT',
                    body: JSON.stringify(body),
                });
                const result = (await res.json()) as ApiResult;
                if (!res.ok || result.success === false) {
                    message.error(result.message || '更新失败');
                    return;
                }
                writeLocationPrefs(currentProductId, values.defaultWarehouseId, values.defaultPositionId);
                message.success(result.message || '商品更新成功');
            } else {
                const res = await requestWithAuth(`${API_BASE}/products`, {
                    method: 'POST',
                    body: JSON.stringify(body),
                });
                const result = (await res.json()) as ApiResult;
                if (!res.ok || result.success === false) {
                    message.error(result.message || '添加失败');
                    return;
                }
                const created = result.data;
                const newId = created != null && created.id != null ? String(created.id) : '';
                if (newId) {
                    writeLocationPrefs(newId, values.defaultWarehouseId, values.defaultPositionId);
                }
                message.success(result.message || '商品添加成功');
            }
            onSuccess?.();
            props.onClose();
        } catch (e) {
            message.error('请求失败: ' + (e as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            footer={null}
            width={600}
            open={visible}
            title={currentProductId ? '编辑商品' : '添加商品'}
            onCancel={props.onClose}
            confirmLoading={detailLoading}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                {currentProductId ? (
                    <Form.Item label="商品ID">
                        <Input disabled value={currentProductId} />
                    </Form.Item>
                ) : null}
                <Form.Item label="商品名称" name="name" rules={[{ required: true, message: '请输入商品名称' }]}>
                    <Input placeholder="请输入商品名称" />
                </Form.Item>
                <Form.Item label="类别" name="category" rules={[{ required: true, message: '请输入类别' }]}>
                    <Input placeholder="请输入类别" />
                </Form.Item>
                <Form.Item label="货币" name="currency" tooltip="选填，当前版本仅作展示，不写入数据库">
                    <Select
                        allowClear
                        placeholder="可选"
                        options={currencyConfig.map((item: { label: string; code: string }) => ({
                            label: item.label,
                            value: item.code,
                        }))}
                    />
                </Form.Item>
                <Form.Item label="价格" name="price" rules={[{ required: true, message: '请输入价格' }]}>
                    <InputNumber style={{ width: '100%' }} min={0} step={0.01} precision={2} placeholder="请输入价格" />
                </Form.Item>
                <Form.Item label="计量单位" name="unit" tooltip="选填，当前版本仅作展示，不写入数据库">
                    <Select
                        allowClear
                        placeholder="可选"
                        options={unitConfig.map((item: { label: string; code: string }) => ({
                            label: item.label,
                            value: item.code,
                        }))}
                    />
                </Form.Item>
                <Form.Item label="安全库存" name="safeStock" tooltip="低于该值可在低库存预警中关注">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="可选，整数" precision={0} />
                </Form.Item>
                <Form.Item label="状态" name="status" valuePropName="checked">
                    <Switch checkedChildren="上架" unCheckedChildren="下架" />
                </Form.Item>
                {!currentProductId && (
                    <Form.Item label="初始库存">
                        <InputNumber
                            style={{ width: '100%' }}
                            value={0}
                            disabled
                            placeholder="新建商品默认库存为0，请通过入库操作增加库存"
                        />
                    </Form.Item>
                )}
                <Form.Item
                    label="默认仓库"
                    name="defaultWarehouseId"
                    tooltip="保存在浏览器本地，用于后续入库等操作默认选中"
                >
                    <Select
                        placeholder="请选择仓库"
                        allowClear
                        options={warehouseList.map((item) => ({
                            label: item.name,
                            value: item.id,
                            disabled: item.status !== '1',
                        }))}
                        onChange={() => {
                            form.setFieldValue('defaultPositionId', undefined);
                        }}
                    />
                </Form.Item>
                <Form.Item
                    label="默认仓位"
                    name="defaultPositionId"
                    tooltip="需先选仓库；保存在浏览器本地"
                >
                    <TreeSelect
                        placeholder={selectedWarehouse ? '请选择仓位（可选）' : '请先选择仓库'}
                        allowClear
                        disabled={!selectedWarehouse}
                        loading={positionsLoading}
                        treeData={positionTreeData}
                        treeDefaultExpandAll
                        showSearch
                        treeNodeFilterProp="title"
                        fieldNames={{ label: 'title', value: 'value', children: 'children' }}
                        notFoundContent={
                            positionsLoading
                                ? '加载中…'
                                : selectedWarehouse
                                    ? '该仓库暂无仓位，请先在仓位管理中维护'
                                    : '请先选择仓库'
                        }
                    />
                </Form.Item>
                <Form.Item>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={props.onClose} disabled={submitting}>
                            取消
                        </Button>
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            保存
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default AddProductModal;
