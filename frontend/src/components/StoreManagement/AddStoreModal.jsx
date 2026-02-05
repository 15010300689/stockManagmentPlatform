import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch } from 'antd';

function AddStoreModal(props) {
    const { mode, isOpen, onCancel, currentStoreInfo = {} } = props;
    const [form] = Form.useForm();

    useEffect(() => {
        if (mode === "edit" && currentStoreInfo.id) {
            form.setFieldsValue({
                code: currentStoreInfo.code,
                name: currentStoreInfo.name,
                address: currentStoreInfo.address || '',
                contact: currentStoreInfo.contact || '',
                phone: currentStoreInfo.phone || '',
                status: currentStoreInfo.status === '1' || currentStoreInfo.status === 1
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                status: true
            });
        }
    }, [mode, isOpen, currentStoreInfo]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const submitData = {
                ...values,
                status: values.status ? '1' : '0'
            };
            props.onSubmit && props.onSubmit(submitData, mode);
        } catch (error) {
            console.error('表单验证失败:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={mode === "add" ? "新增仓库" : "编辑仓库"}
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
                    label="仓库编码" 
                    name="code" 
                    rules={[{ required: true, message: '请输入仓库编码' }]}
                >
                    <Input 
                        placeholder="请输入仓库编码" 
                        disabled={mode === "edit"}
                    />
                </Form.Item>
                <Form.Item 
                    label="仓库名称" 
                    name="name" 
                    rules={[{ required: true, message: '请输入仓库名称' }]}
                >
                    <Input placeholder="请输入仓库名称" />
                </Form.Item>
                <Form.Item 
                    label="仓库地址" 
                    name="address"
                >
                    <Input placeholder="请输入仓库地址" />
                </Form.Item>
                <Form.Item 
                    label="联系人" 
                    name="contact"
                >
                    <Input placeholder="请输入联系人" />
                </Form.Item>
                <Form.Item 
                    label="联系电话" 
                    name="phone"
                >
                    <Input placeholder="请输入联系电话" />
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

export default AddStoreModal;
