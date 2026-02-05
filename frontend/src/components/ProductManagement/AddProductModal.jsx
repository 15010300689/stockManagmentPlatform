import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, InputNumber, Form, Space, Select, TreeSelect } from 'antd';
import { currencyConfig } from '../../config/currencyConfig';
import { unitConfig } from '../../config/unitConfig';



function AddProductModal(props) {
    const [form] = Form.useForm();
    const {
        currentProductId = '',
        visible = false,
        warehouseList = [],
        positionTree = []
    } = props;

    const [selectedWarehouse, setSelectedWarehouse] = useState(null);

    useEffect(() => {
        if (!visible) {
            form.resetFields();
            setSelectedWarehouse(null);
        }
    }, [visible]);

    const buildTree = (data, parentId = null) => {
        return data
            .filter((item) => (item.parentId === null && parentId === null) ||
                (item.parentId !== null && parentId !== null && String(item.parentId) === String(parentId)))
            .map((item) => {
                const children = buildTree(data, item.id);
                return {
                    id: item.id,
                    title: `${item.code}${item.name ? ' - ' + item.name : ''}`,
                    value: item.id,
                    warehouseId: item.warehouseId,
                    children: children.length > 0 ? children : undefined,
                };
            });
    };

    const filteredTree = () => {
        if (!selectedWarehouse) return [];
        return buildTree(positionTree.filter(item => item.warehouseId === selectedWarehouse));
    };

    const onFinish = (values) => {
        console.log('Form values:', values);
        // 保存商品逻辑
    }
    return (
        <Modal
            footer={null}
            width={600}
            open={visible}
            title={currentProductId ? '编辑商品' : '添加商品'}
            onCancel={() => props.onClose()}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}>
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
                    label="货币"
                    name="currency"
                    disabled={!!currentProductId}
                    rules={[{ required: true, message: '请选择货币类型' }]}
                >
                    <Select placeholder="请选择货币类型" options={currencyConfig.map(item => ({
                        label: item.label,
                        value: item.code
                    }))} />
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
                <Form.Item
                    label="计量单位"
                    name="unit"
                    rules={[{ required: true, message: '请选择计量单位' }]}
                >
                    <Select placeholder="请选择计量单位" options={unitConfig.map(item => ({
                        label: item.label,
                        value: item.code
                    }))} />
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
                <Form.Item
                    label="默认仓库"
                    name="defaultWarehouseId"
                >
                    <Select
                        placeholder="可选，设置后库存操作默认选中"
                        allowClear
                        options={warehouseList.map(item => ({
                            label: item.name,
                            value: item.id,
                            disabled: item.status !== '1'
                        }))}
                        onChange={(val) => {
                            setSelectedWarehouse(val || null);
                            form.setFieldValue('defaultPositionId', undefined);
                        }}
                    />
                </Form.Item>
                <Form.Item
                    label="默认仓位"
                    name="defaultPositionId"
                >
                    <TreeSelect
                        placeholder="可选，精确到仓位"
                        allowClear
                        disabled={!selectedWarehouse}
                        treeData={filteredTree()}
                        treeDefaultExpandAll
                        fieldNames={{
                            label: 'title',
                            value: 'id',
                            children: 'children'
                        }}
                    />
                </Form.Item>
                <Form.Item>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={() => props.onClose()}>取消</Button>
                        <Button type="primary" htmlType="submit">保存</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    )
}
export default AddProductModal;