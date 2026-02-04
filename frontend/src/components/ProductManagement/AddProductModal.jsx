import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, InputNumber, Form, Space, Select } from 'antd';
import { currencyConfig } from '../../config/currencyConfig';
import { unitConfig } from '../../config/unitConfig';



function AddProductModal(props) {
    const [form] = Form.useForm();
    const { currentProductId = '', visible = false } = props;
    useEffect(() => {
        console.log('currentProductId:', visible);
    }, [])

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