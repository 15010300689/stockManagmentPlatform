import React, { useEffect, useMemo, useState } from 'react';
import {
    Card,
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Switch,
    message
} from 'antd';
import { authFetch } from '../auth';

const API_BASE = '/api';

interface MenuItem {
    id: number;
    parentId?: number;
    name: string;
    path: string;
    icon?: string;
    sortNo?: number;
    visible: number;
    status: number;
    level?: number;
    children?: MenuItem[];
}

interface MenuFormValues {
    parentId: number;
    name: string;
    path: string;
    icon?: string;
    sortNo: number;
    visible: boolean;
    status: boolean;
}

function PermissionManagement(): JSX.Element {
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [editing, setEditing] = useState<MenuItem | null>(null);
    const [lockedParentMenu, setLockedParentMenu] = useState<MenuItem | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm<MenuFormValues>();

    const loadMenus = async () => {
        setLoading(true);
        try {
            const res = await authFetch(`${API_BASE}/admin/menus`);
            const data = await res.json();
            setMenus(Array.isArray(data) ? data : []);
        } catch (e) {
            message.error('加载菜单失败: ' + (e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMenus();
    }, []);

    const menuByParent = useMemo(() => {
        const map = new Map<number, MenuItem[]>();
        menus.forEach((m) => {
            const pid = m.parentId ?? 0;
            if (!map.has(pid)) map.set(pid, []);
            map.get(pid)?.push(m);
        });
        for (const arr of map.values()) {
            arr.sort((a, b) => (a.sortNo || 0) - (b.sortNo || 0));
        }
        return map;
    }, [menus]);

    const buildTreeRows = (parentId = 0, level = 0): MenuItem[] => {
        const list = menuByParent.get(parentId) || [];
        return list.map((item) => ({
            ...item,
            level,
            children: buildTreeRows(item.id, level + 1)
        }));
    };

    const tableData = useMemo(() => buildTreeRows(0, 0), [menuByParent]);

    const parentOptions = useMemo(() => {
        const opts = [{ label: '根节点', value: 0 }];
        menus.forEach((m) => {
            opts.push({ label: `${m.name} (${m.path})`, value: m.id });
        });
        return opts;
    }, [menus]);

    const openAddModal = () => {
        setEditing(null);
        setLockedParentMenu(null);
        form.setFieldsValue({
            parentId: 0,
            name: '',
            path: '',
            icon: '',
            sortNo: 0,
            visible: true,
            status: true,
        });
        setModalVisible(true);
    };

    const openAddChildModal = (parent: MenuItem) => {
        setEditing(null);
        setLockedParentMenu(parent);
        form.setFieldsValue({
            parentId: parent.id,
            name: '',
            path: '',
            icon: '',
            sortNo: 0,
            visible: true,
            status: true,
        });
        setModalVisible(true);
    };

    const openEditModal = (record: MenuItem) => {
        setEditing(record);
        setLockedParentMenu(null);
        form.setFieldsValue({
            parentId: record.parentId ?? 0,
            name: record.name,
            path: record.path,
            icon: record.icon,
            sortNo: record.sortNo ?? 0,
            visible: record.visible === 1,
            status: record.status === 1,
        });
        setModalVisible(true);
    };

    const saveMenu = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                parentId: values.parentId,
                name: values.name,
                path: values.path,
                icon: values.icon,
                sortNo: values.sortNo,
                visible: values.visible ? 1 : 0,
                status: values.status ? 1 : 0,
            };

            const url = editing
                ? `${API_BASE}/admin/menu/${editing.id}`
                : `${API_BASE}/admin/menu`;
            const method = editing ? 'PUT' : 'POST';

            const res = await authFetch(url, {
                method,
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                message.success(data.message || '保存成功');
                setModalVisible(false);
                setLockedParentMenu(null);
                await loadMenus();
            } else {
                message.error(data.message || '保存失败');
            }
        } catch (e: unknown) {
            if ((e as { errorFields?: unknown }).errorFields) return;
            message.error('保存失败: ' + (e as Error).message);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setLockedParentMenu(null);
    };

    const columns = [
        {
            title: '菜单名称',
            dataIndex: 'name',
            key: 'name',
            render: (_: unknown, record: MenuItem) => (
                <span style={{ paddingLeft: (record.level || 0) * 18 }}>
                    {record.icon ? `${record.icon} ` : ''}{record.name}
                </span>
            )
        },
        { title: '路由路径', dataIndex: 'path', key: 'path', width: 220 },
        { title: '父级ID', dataIndex: 'parentId', key: 'parentId', width: 100 },
        { title: '排序', dataIndex: 'sortNo', key: 'sortNo', width: 80 },
        {
            title: '可见',
            dataIndex: 'visible',
            key: 'visible',
            width: 80,
            render: (v: number) => (v === 1 ? '是' : '否')
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: (v: number) => (v === 1 ? '启用' : '停用')
        },
        {
            title: '操作',
            key: 'action',
            width: 220,
            render: (_: unknown, record: MenuItem) => (
                <>
                    <Button type="link" onClick={() => openAddChildModal(record)}>
                        新增子菜单
                    </Button>
                    <Button type="link" onClick={() => openEditModal(record)}>
                        编辑
                    </Button>
                </>
            )
        }
    ];

    return (
        <>
            <Card
                title="菜单配置（仅维护菜单结构）"
                extra={<Button type="primary" onClick={openAddModal}>新增菜单</Button>}
            >
                <Table<MenuItem>
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={tableData}
                    pagination={false}
                />
            </Card>

            <Modal
                title={editing ? '编辑菜单' : '新增菜单'}
                open={modalVisible}
                onCancel={closeModal}
                onOk={saveMenu}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="父菜单" name="parentId" rules={[{ required: true, message: '请选择父菜单' }]}>
                        <Select
                            options={parentOptions}
                            disabled={!!lockedParentMenu}
                        />
                    </Form.Item>
                    {lockedParentMenu && (
                        <div style={{ marginTop: -8, marginBottom: 12, color: '#999', fontSize: 12 }}>
                            当前为“新增子菜单”模式，父菜单已锁定为：{lockedParentMenu.name} ({lockedParentMenu.path})
                        </div>
                    )}
                    <Form.Item label="菜单名称" name="name" rules={[{ required: true, message: '请输入菜单名称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="路由路径" name="path" rules={[{ required: true, message: '请输入路由路径' }]}>
                        <Input placeholder="如 /permission/menu" />
                    </Form.Item>
                    <Form.Item label="图标" name="icon">
                        <Input placeholder="可填 emoji，如 🔗" />
                    </Form.Item>
                    <Form.Item label="排序" name="sortNo">
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="是否可见" name="visible" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item label="状态(启用)" name="status" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default PermissionManagement;
