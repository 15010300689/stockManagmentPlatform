import React, { useEffect } from 'react';
import { Modal, Form, Input, Space, Tree, Table } from 'antd';
import type { RoleFormValues, RoleItem } from '../../types/role';

interface PermissionItem {
    id: number;
    permissionName: string;
    permissionCode: string;
    method: string;
    path: string;
}

interface MenuTreeNode {
    title: string;
    key: number;
    children?: MenuTreeNode[];
}

interface AddRoleModalProps {
    mode: 'add' | 'edit';
    isOpen: boolean;
    onCancel: () => void;
    onSubmit?: (
        values: RoleFormValues,
        menuIds: React.Key[],
        permissionIds: React.Key[],
        mode: 'add' | 'edit'
    ) => void;
    currentRoleInfo?: Partial<RoleItem>;
    menuTreeData?: MenuTreeNode[];
    permissions?: PermissionItem[];
    checkedMenuIds?: React.Key[];
    checkedPermissionIds?: React.Key[];
    loadingAuthData?: boolean;
    onCheckedMenuIdsChange?: (keys: React.Key[]) => void;
    onCheckedPermissionIdsChange?: (keys: React.Key[]) => void;
}

function AddRoleModal(props: AddRoleModalProps): JSX.Element {
    const { mode, isOpen, onCancel, currentRoleInfo = {} } = props;
    const [form] = Form.useForm<RoleFormValues>();

    useEffect(() => {
        if (mode === 'edit' && currentRoleInfo.id) {
            form.setFieldsValue({
                roleName: currentRoleInfo.roleName,
                roleDescription: currentRoleInfo.desc || currentRoleInfo.roleDescription || '',
                roleDuty: currentRoleInfo.roleMap || currentRoleInfo.roleDuty || ''
            });
        } else if (mode === 'add') {
            form.resetFields();
            form.setFieldsValue({
                roleName: '',
                roleDescription: '',
                roleDuty: ''
            });
        }
    }, [mode, isOpen, currentRoleInfo, form]);

    const handleSubmit = async () => {
        const values = await form.validateFields();
        props.onSubmit?.(
            values,
            props.checkedMenuIds || [],
            props.checkedPermissionIds || [],
            mode
        );
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={mode === 'add' ? '添加角色' : '编辑角色'}
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
                    roleName: '',
                    roleDescription: ''
                }}
            >
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
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
                <div style={{ fontWeight: 600 }}>菜单授权</div>
                <Tree
                    checkable
                    defaultExpandAll
                    checkedKeys={props.checkedMenuIds || []}
                    onCheck={(keys) => props.onCheckedMenuIdsChange?.(keys as React.Key[])}
                    treeData={props.menuTreeData || []}
                />
                <div style={{ fontWeight: 600 }}>按钮/接口权限授权</div>
                <Table<PermissionItem>
                    rowKey="id"
                    size="small"
                    loading={props.loadingAuthData}
                    dataSource={props.permissions || []}
                    pagination={{ pageSize: 8 }}
                    rowSelection={{
                        selectedRowKeys: props.checkedPermissionIds || [],
                        onChange: (keys) => props.onCheckedPermissionIdsChange?.(keys),
                    }}
                    columns={[
                        { title: '权限名', dataIndex: 'permissionName', key: 'permissionName' },
                        { title: '权限码', dataIndex: 'permissionCode', key: 'permissionCode', width: 180 },
                        { title: '方法', dataIndex: 'method', key: 'method', width: 80 },
                        { title: '路径', dataIndex: 'path', key: 'path' },
                    ]}
                />
            </Space>
        </Modal>
    );
}

export default AddRoleModal;
