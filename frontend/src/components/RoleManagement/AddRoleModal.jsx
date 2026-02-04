import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
function AddRoleModal(props) {
    const { mode, isOpen, onCancel, currentRoleInfo = {} } = props;
    const [form] = Form.useForm();
    useEffect(() => {
        if (mode === "edit" && currentRoleInfo.id) {
            form.setFieldsValue({
                roleName: currentRoleInfo?.name,
                roleDescription: currentRoleInfo?.roleDescription || '',
                roleDuty: currentRoleInfo?.roleDuty || ''
            });
        }
    }, [mode, isOpen]);

    const handleSubmit = () => {
        onCancel();
        props.onUpdate && props.onUpdate();
    }
    const handleCancel = () => {
        form.resetFields();
        onCancel();
    }

    return (
        <Modal
            title={mode === "add" ? "添加角色" : "编辑角色"}
            open={isOpen}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText="确定"
            cancelText="取消"
            width={600}
        >
            <Form layout="line" form={form}
                initialValues={{
                    roleName: '',
                    roleDescription: ''
                }}>
                <Form.Item label="角色名称" name="roleName" rules={[{ required: true, message: '请输入角色名称' }]}>
                    <Input placeholder="请输入角色名称" />
                </Form.Item>
                <Form.Item label="权限职责" name="roleDescription">
                    <Input.TextArea rows={4} placeholder="请输入权限职责" />
                </Form.Item>
                <Form.Item label="典型权限" name="roleDuty">
                    <Input.TextArea rows={4} placeholder="请输入典型权限" />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default AddRoleModal;