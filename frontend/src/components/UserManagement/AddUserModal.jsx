import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';

import { roleList } from '../../mock/roleList'

function AddUserModal(props) {
    const { mode, isOpen, onCancel, currentUserInfo = {} } = props;
    const [form] = Form.useForm();
    useEffect(() => {
        if (mode === "edit" && currentUserInfo.id) {
            form.setFieldsValue({
                userName: currentUserInfo?.userName,
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
            title={mode === "add" ? "添加用户" : "编辑用户信息"}
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
                <Form.Item label="用户名称" name="userName" rules={[{ required: true, message: '请输入角色名称' }]}>
                    <Input placeholder="请输入用户名称" />
                </Form.Item>
                <Form.Item label="用户角色" name="roleList" rules={[{ required: true, message: '请选择角色' }]}>
                    <Select mode="multiple" placeholder="请选择角色" options={roleList.map(item => ({value: item.id, label: item.roleName}))} />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default AddUserModal;