import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, TreeSelect, Space } from 'antd';
import { unitConfig } from '../../config/unitConfig';
import type { PositionItem, StoreItem } from '../../types/inventory';

interface PositionFormValues {
    warehouseId: number;
    parentId: number;
    code: string;
    type: string;
    maxCapacity: number;
    unit: string;
    status: boolean;
}

interface PositionSubmitPayload extends Omit<PositionFormValues, 'status'> {
    status: '0' | '1';
}

interface PositionTreeOption {
    id: number;
    title: string;
    value: number;
    children?: PositionTreeOption[];
}

interface AddPositionModalProps {
    mode: 'add' | 'edit';
    isOpen: boolean;
    onCancel: () => void;
    onSubmit?: (data: PositionSubmitPayload, mode: 'add' | 'edit') => void;
    currentPositionInfo?: Partial<PositionItem>;
    warehouseList?: StoreItem[];
    positionTree?: PositionItem[];
}

function AddPositionModal(props: AddPositionModalProps): JSX.Element {
    const {
        mode,
        isOpen,
        onCancel,
        currentPositionInfo = {},
        warehouseList = [],
        positionTree = []
    } = props;
    const [form] = Form.useForm<PositionFormValues>();
    const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);

    useEffect(() => {
        if (mode === 'edit' && currentPositionInfo.id) {
            form.setFieldsValue({
                warehouseId: currentPositionInfo.warehouseId,
                parentId: currentPositionInfo.parentId ?? undefined,
                code: currentPositionInfo.code,
                type: currentPositionInfo.type,
                maxCapacity: currentPositionInfo.maxCapacity,
                unit: currentPositionInfo.unit,
                status: currentPositionInfo.status === '1'
            } as PositionFormValues);
            setSelectedWarehouse(currentPositionInfo.warehouseId ?? null);
        } else {
            form.resetFields();
            form.setFieldsValue({
                status: true
            } as PositionFormValues);
            setSelectedWarehouse(null);
        }
    }, [mode, isOpen, currentPositionInfo, form]);

    const handleWarehouseChange = (value: number) => {
        setSelectedWarehouse(value);
        form.setFieldsValue({ parentId: undefined });
    };

    // 根据选中的仓库过滤并构建树数据
    const buildTree = (data: PositionItem[], parentId: number | null = null): PositionTreeOption[] => {
        return data
            .filter(item => {
                const matchWarehouse = item.warehouseId === selectedWarehouse ||
                    (item.warehouseId && String(item.warehouseId) === String(selectedWarehouse));
                const matchParent = (item.parentId === null && parentId === null) ||
                    (item.parentId !== null && parentId !== null &&
                    (item.parentId === parentId || String(item.parentId) === String(parentId)));
                return matchWarehouse && matchParent;
            })
            .map(item => {
                const children = buildTree(data, item.id);
                return {
                    id: item.id,
                    title: `${item.code}${item.name ? ' - ' + item.name : ''}`,
                    value: item.id,
                    children: children.length > 0 ? children : undefined
                };
            });
    };

    const getFilteredTree = (): PositionTreeOption[] => {
        if (!selectedWarehouse) return [];
        return buildTree(positionTree);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const submitData = {
                ...values,
                status: (values.status ? '1' : '0') as '0' | '1'
            };
            props.onSubmit?.(submitData, mode);
        } catch (error) {
            console.error('表单验证失败:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setSelectedWarehouse(null);
        onCancel();
    };

    const typeOptions = [
        { label: '库区', value: 'area' },
        { label: '货架', value: 'shelf' },
        { label: '层', value: 'level' },
        { label: '仓位', value: 'position' }
    ];

    return (
        <Modal
            title={mode === 'add' ? '新增仓位' : '编辑仓位'}
            open={isOpen}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText="确定"
            cancelText="取消"
            width={600}
        >
            <Form
                layout="vertical"
                form={form}
                initialValues={{
                    status: true
                }}
            >
                <Form.Item
                    label="所属仓库"
                    name="warehouseId"
                    rules={[{ required: true, message: '请选择所属仓库' }]}
                >
                    <Select
                        placeholder="请选择所属仓库"
                        onChange={handleWarehouseChange}
                        disabled={mode === 'edit'}
                        options={warehouseList.map(item => ({
                            label: item.name,
                            value: item.id
                        }))}
                    />
                </Form.Item>
                <Form.Item
                    label="上级层级"
                    name="parentId"
                    rules={[{ required: true, message: '请选择上级层级' }]}
                >
                    <TreeSelect
                        placeholder="请选择上级层级"
                        treeData={getFilteredTree()}
                        disabled={!selectedWarehouse}
                        treeDefaultExpandAll
                        showSearch
                        treeNodeFilterProp="title"
                        fieldNames={{
                            label: 'title',
                            value: 'id',
                            children: 'children'
                        }}
                    />
                </Form.Item>
                <Form.Item
                    label="仓位编码"
                    name="code"
                    rules={[{ required: true, message: '请输入仓位编码' }]}
                >
                    <Input
                        placeholder="请输入仓位编码"
                        disabled={mode === 'edit'}
                    />
                </Form.Item>
                <Form.Item
                    label="类型"
                    name="type"
                >
                    <Select
                        placeholder="请选择类型"
                        options={typeOptions}
                    />
                </Form.Item>
                <Form.Item
                    label="最大容量"
                    name="maxCapacity"
                    rules={[{ required: true, message: '请输入最大容量' }]}
                >
                    <Space.Compact>
                        <InputNumber
                            style={{ width: '70%' }}
                            min={0}
                            placeholder="请输入最大容量"
                        />
                        <Form.Item
                            name="unit"
                            noStyle
                            rules={[{ required: true, message: '请选择单位' }]}
                        >
                            <Select
                                style={{ width: '30%' }}
                                placeholder="单位"
                                options={unitConfig.map(item => ({
                                    label: item.label,
                                    value: item.code
                                }))}
                            />
                        </Form.Item>
                    </Space.Compact>
                </Form.Item>
                <Form.Item
                    label="状态"
                    name="status"
                    valuePropName="checked"
                >
                    <Switch checkedChildren="启用" unCheckedChildren="停用" />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default AddPositionModal;
