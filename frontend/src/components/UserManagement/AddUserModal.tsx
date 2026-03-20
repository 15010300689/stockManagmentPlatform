import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';

import { roleList } from '../../mock/roleList';
import type { RoleItem } from '../../types/role';
import type { UserItem } from '../../types/user';

interface AddUserFormValues {
    userName: string;
    roleList: number[];
}

interface AddUserModalProps {
    mode: 'add' | 'edit';
    isOpen: boolean;
    onCancel: () => void;
    onUpdate?: () => void;
    currentUserInfo?: Partial<UserItem>;
}

function AddUserModal(props: AddUserModalProps): JSX.Element {
    const { mode, isOpen, onCancel, currentUserInfo = {} } = props;
    const [form] = Form.useForm<AddUserFormValues>();

    useEffect(() => {
        if (mode === 'edit' && currentUserInfo.id) {
            form.setFieldsValue({
                userName: currentUserInfo.userName,
                roleList: (currentUserInfo.roleList || []).map(role => role.id)
            });
        }
    }, [mode, isOpen, currentUserInfo, form]);

    const handleSubmit = () => {
        onCancel();
        props.onUpdate?.();
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={mode === 'add' ? '添加用户' : '编辑用户信息'}
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
                    userName: '',
                    roleList: []
                }}
            >
                <Form.Item label="用户名称" name="userName" rules={[{ required: true, message: '请输入用户名称' }]}>
                    <Input placeholder="请输入用户名称" />
                </Form.Item>
                <Form.Item label="用户角色" name="roleList" rules={[{ required: true, message: '请选择角色' }]}>
                    <Select
                        mode="multiple"
                        placeholder="请选择角色"
                        options={roleList.map((item: RoleItem) => ({ value: item.id, label: item.roleName }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default AddUserModal;
