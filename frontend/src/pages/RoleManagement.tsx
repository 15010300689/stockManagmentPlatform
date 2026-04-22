import React, { useEffect, useMemo, useState } from 'react';
import { Card, Space, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import QueryForm from '../components/RoleManagement/QueryForm';
import DataList from '../components/RoleManagement/DataList';
import AddRoleModal from '../components/RoleManagement/AddRoleModal';

import { roleList } from '../mock/roleList';
import { fetchRoles } from '../api/roleManagement';
import type { RoleItem } from '../types/role';
import { authFetch } from '../auth';
import type { RoleFormValues } from '../types/role';

interface QueryParams {
    roleName: string;
}

interface MenuItem {
    id: number;
    parentId?: number;
    name: string;
    path: string;
    icon?: string;
    sortNo?: number;
}

interface PermissionItem {
    id: number;
    permissionName: string;
    permissionCode: string;
    method: string;
    path: string;
}

interface AuthTreeNode {
    title: string;
    key: number;
    children?: AuthTreeNode[];
}

const API_BASE = '/api';

interface RoleApiItem {
    id: number;
    roleName: string;
    createTime?: string;
    roleMap?: string;
    desc?: string;
    description?: string;
}

function RoleManagement(): JSX.Element {
    const [queryParams, setQueryParams] = useState<QueryParams>({
        roleName: '',
    });

    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentRoleInfo, setCurrentRoleInfo] = useState<Partial<RoleItem>>({});
    const [rolesData, setRolesData] = useState<RoleItem[]>(roleList);
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [permissions, setPermissions] = useState<PermissionItem[]>([]);
    const [checkedMenuIds, setCheckedMenuIds] = useState<React.Key[]>([]);
    const [checkedPermissionIds, setCheckedPermissionIds] = useState<React.Key[]>([]);
    const [loadingAuthData, setLoadingAuthData] = useState(false);
    const [savingRoleAuth, setSavingRoleAuth] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(roleList.length);

    const requestTableData = async () => {
        try {
            const { roleName } = queryParams;
            const response = await fetchRoles<RoleApiItem>({ roleName, pageNo, pageSize });
            const normalized: RoleItem[] = (response.data || []).map((item) => ({
                id: item.id,
                roleName: item.roleName,
                createTime: item.createTime || '',
                roleMap: item.roleMap || '',
                desc: item.desc || item.description || '',
                roleDescription: item.desc || item.description || '',
                roleDuty: item.roleMap || ''
            }));

            return {
                data: normalized,
                total: response.total || 0,
            };
        } catch (e) {
            console.error(e);
            return {
                data: [],
                total: 0,
            };
        }
    };

    const loadMenuAndPermissionBase = async () => {
        try {
            const [menuRes, permissionRes] = await Promise.all([
                authFetch(`${API_BASE}/admin/menus`),
                authFetch(`${API_BASE}/admin/permissions`)
            ]);
            const [menuData, permissionData] = await Promise.all([menuRes.json(), permissionRes.json()]);
            setMenus(Array.isArray(menuData) ? menuData : []);
            setPermissions(Array.isArray(permissionData) ? permissionData : []);
        } catch (e) {
            message.error('加载权限基础数据失败: ' + (e as Error).message);
        }
    };

    useEffect(() => {
        loadMenuAndPermissionBase();
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const result = await requestTableData();
            setRolesData(result.data as RoleItem[]);
            setTotal(result.total);
            setLoading(false);
        };
        void load();
    }, [pageNo, pageSize, queryParams.roleName]);

    const menuTreeData = useMemo<AuthTreeNode[]>(() => {
        const byParent = new Map<number, MenuItem[]>();
        menus.forEach((m) => {
            const pid = m.parentId ?? 0;
            if (!byParent.has(pid)) byParent.set(pid, []);
            byParent.get(pid)?.push(m);
        });
        for (const arr of byParent.values()) {
            arr.sort((a, b) => (a.sortNo || 0) - (b.sortNo || 0));
        }
        const build = (parentId: number): AuthTreeNode[] => {
            return (byParent.get(parentId) || []).map((m) => {
                const children = build(m.id);
                return {
                    title: `${m.icon ? `${m.icon} ` : ''}${m.name} (${m.path})`,
                    key: m.id,
                    children: children.length > 0 ? children : undefined
                };
            });
        };
        return build(0);
    }, [menus]);

    const columns: ColumnsType<RoleItem> = [
        {
            title: '角色ID',
            dataIndex: 'id',
            key: 'id',
            width: '160',
            align: 'center',
            fixed: 'left',
        },
        {
            title: '角色名称',
            dataIndex: 'roleName',
            key: 'name',
            align: 'center',
            fixed: 'left',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
        },
        {
            title: '权限职责',
            dataIndex: 'desc',
            key: 'desc',
            render: (text: string) => (
                <ul>
                    {text.split('、').map(item => <li key={item}>{item}</li>)}
                </ul>
            )
        },
        {
            title: '典型权限',
            dataIndex: 'roleMap',
            key: 'roleMap',
            render: (text: string) => (
                <ul>
                    {text.split('、').map(item => <li key={item}>{item}</li>)}
                </ul>
            )
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            width: '160',
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button type="link" size="small" onClick={() => onEditRole(record)}>编辑</Button>
                    <Button type="link" size="small" onClick={() => onDeleteRole(record)}>删除</Button>
                </Space>
            ),
        }
    ];

    const onSearch = (roleName: string) => {
        setQueryParams({ roleName });
        setPageNo(1);
    };

    const onPageChange = (nextPageNo: number, nextPageSize: number) => {
        setPageNo(nextPageNo);
        setPageSize(nextPageSize);
    };
    const onAddRole = () => {
        setCurrentRoleInfo({});
        setMode('add');
        setCheckedMenuIds([]);
        setCheckedPermissionIds([]);
        setIsAddModalOpen(true);
    };
    const onEditRole = (record: RoleItem) => {
        setCurrentRoleInfo(record);
        setMode('edit');
        void loadRoleAuth(record.id);
        setIsAddModalOpen(true);
    };
    const onDeleteRole = (_record: RoleItem) => {};

    const loadRoleAuth = async (roleId: number) => {
        setLoadingAuthData(true);
        try {
            const [menuRes, permissionRes] = await Promise.all([
                authFetch(`${API_BASE}/admin/role/${roleId}/menu-ids`),
                authFetch(`${API_BASE}/admin/role/${roleId}/permission-ids`)
            ]);
            const [menuIds, permissionIds] = await Promise.all([menuRes.json(), permissionRes.json()]);
            setCheckedMenuIds(Array.isArray(menuIds) ? menuIds : []);
            setCheckedPermissionIds(Array.isArray(permissionIds) ? permissionIds : []);
        } catch (e) {
            message.error('加载角色权限失败: ' + (e as Error).message);
        } finally {
            setLoadingAuthData(false);
        }
    };

    const saveRoleAuth = async (roleId: number, menuIds: React.Key[], permissionIds: React.Key[]) => {
        setSavingRoleAuth(true);
        try {
            const [menuRes, permissionRes] = await Promise.all([
                authFetch(`${API_BASE}/admin/role/${roleId}/menus`, {
                    method: 'POST',
                    body: JSON.stringify({ menuIds }),
                }),
                authFetch(`${API_BASE}/admin/role/${roleId}/permissions`, {
                    method: 'POST',
                    body: JSON.stringify({ permissionIds }),
                })
            ]);
            const [menuData, permissionData] = await Promise.all([menuRes.json(), permissionRes.json()]);
            if (menuRes.ok && permissionRes.ok && menuData.success && permissionData.success) {
                return true;
            } else {
                message.error(menuData.message || permissionData.message || '保存失败');
                return false;
            }
        } catch (e) {
            message.error('保存角色权限失败: ' + (e as Error).message);
            return false;
        } finally {
            setSavingRoleAuth(false);
        }
    };

    const onSubmitRole = async (
        values: RoleFormValues,
        menuIds: React.Key[],
        permissionIds: React.Key[],
        submitMode: 'add' | 'edit'
    ) => {
        if (submitMode === 'add') {
            const newId = Math.max(0, ...rolesData.map((r) => r.id)) + 1;
            const role: RoleItem = {
                id: newId,
                roleName: values.roleName,
                createTime: new Date().toISOString().slice(0, 10),
                roleMap: values.roleDuty || '',
                desc: values.roleDescription || '',
                roleDuty: values.roleDuty || '',
                roleDescription: values.roleDescription || ''
            };
            const authSaved = await saveRoleAuth(newId, menuIds, permissionIds);
            if (!authSaved) return;
            setRolesData((prev) => [role, ...prev]);
            message.success('新增角色并保存权限成功');
            setIsAddModalOpen(false);
            return;
        }

        if (!currentRoleInfo.id) return;
        const authSaved = await saveRoleAuth(currentRoleInfo.id, menuIds, permissionIds);
        if (!authSaved) return;
        setRolesData((prev) => prev.map((item) => (
            item.id === currentRoleInfo.id
                ? {
                    ...item,
                    roleName: values.roleName,
                    roleMap: values.roleDuty || '',
                    desc: values.roleDescription || '',
                    roleDuty: values.roleDuty || '',
                    roleDescription: values.roleDescription || ''
                }
                : item
        )));
        message.success('编辑角色并保存权限成功');
        setIsAddModalOpen(false);
    };

    return (
        <Card title="角色管理">
            <QueryForm
                onSearch={onSearch}
                onAddRole={onAddRole}
            />
            <DataList
                columns={columns}
                dataSource={rolesData}
                tableProps={{
                    loading,
                    pagination: {
                        current: pageNo,
                        pageSize,
                        total,
                        showSizeChanger: true,
                        onChange: onPageChange,
                        showTotal: (count) => `共 ${count} 条记录`,
                    }
                }}
            />
            <AddRoleModal
                mode={mode}
                isOpen={isAddModalOpen}
                currentRoleInfo={currentRoleInfo}
                menuTreeData={menuTreeData}
                permissions={permissions}
                checkedMenuIds={checkedMenuIds}
                checkedPermissionIds={checkedPermissionIds}
                loadingAuthData={loadingAuthData}
                onCheckedMenuIdsChange={setCheckedMenuIds}
                onCheckedPermissionIdsChange={setCheckedPermissionIds}
                onSubmit={onSubmitRole}
                onCancel={() => {
                    setMode('add');
                    setCurrentRoleInfo({});
                    setCheckedMenuIds([]);
                    setCheckedPermissionIds([]);
                    setIsAddModalOpen(false);
                }}
            />
        </Card>
    );
}

export default RoleManagement;
