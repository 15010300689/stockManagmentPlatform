import React, { useCallback, useEffect, useState } from 'react';
import { Card, Space, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import QueryForm from '../components/UserManagement/QueryForm';
import DataList from '../components/UserManagement/DataList';
import AddUserModal from '../components/UserManagement/AddUserModal';
import { requestWithAuth } from '../api/client';

import { userList } from '../mock/userList';
import { roleList } from '../mock/roleList';
import RenderOverTag from '../components/RenderOverTag';
import type { UserItem } from '../types/user';

const API_BASE = '/api';

interface UserListResponse {
    data?: UserItem[];
    total?: number;
    pageNo?: number;
    pageSize?: number;
}

interface UserRoleOption {
    id: number;
    roleName: string;
}

interface UserFormValues {
    userName: string;
    roleList: number[];
}

function UserManagement(): JSX.Element {
    const columns: ColumnsType<UserItem> = [
        {
            title: '用户ID',
            dataIndex: 'id',
            key: 'id',
            width: 200,
            align: 'center',
            fixed: 'left',
        },
        {
            title: '用户名称',
            dataIndex: 'userName',
            key: 'name',
            align: 'center',
            fixed: 'left',
            width: 200,
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            align: 'center',
            width: 300,
            render: (createTime: string) => (dayjs(createTime).format('YYYY-MM-DD HH:mm:ss')),
        },
        {
            title: '角色',
            dataIndex: 'roleList',
            key: 'roleList',
            align: 'center',
            render: (roles: UserItem['roleList']) => (
                RenderOverTag(roles.map(item => {
                    return {
                        id: item.id,
                        name: item.roleName
                    };
                }))
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
                    <Button type="link" size="small" onClick={() => onEditUser(record)}>编辑</Button>
                    <Button type="link" size="small" onClick={() => onDeleteUser(record)}>删除</Button>
                </Space>
            ),
        }
    ];

    const [queryParams, setQueryParams] = useState({
        userName: '',
    });

    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentUserInfo, setCurrentUserInfo] = useState<Partial<UserItem>>({});
    const [users, setUsers] = useState<UserItem[]>(userList);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [roleOptions, setRoleOptions] = useState<UserRoleOption[]>(roleList);
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(userList.length);

    const requestTableData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (queryParams.userName) {
                params.set('userName', queryParams.userName);
            }
            params.set('pageNo', String(pageNo));
            params.set('pageSize', String(pageSize));
            const response = await requestWithAuth(`${API_BASE}/users?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`请求失败(${response.status})`);
            }
            const payload = (await response.json()) as UserItem[] | UserListResponse;
            const list = Array.isArray(payload)
                ? payload
                : Array.isArray(payload.data)
                    ? payload.data
                    : [];
            setUsers(list);
            if (Array.isArray(payload)) {
                setTotal(list.length);
            } else {
                setTotal(Number(payload.total ?? 0));
                setPageNo(Number(payload.pageNo ?? pageNo));
                setPageSize(Number(payload.pageSize ?? pageSize));
            }
        } catch (error) {
            const filtered = userList.filter((item) => (
                !queryParams.userName || item.userName.includes(queryParams.userName)
            ));
            const start = (pageNo - 1) * pageSize;
            const end = start + pageSize;
            setUsers(filtered.slice(start, end));
            setTotal(filtered.length);
            message.warning('用户接口异常，已回退 mock 分页数据');
            console.warn('load users failed, fallback to mock data:', error);
        } finally {
            setLoading(false);
        }
    }, [pageNo, pageSize, queryParams.userName]);

    useEffect(() => {
        void requestTableData();
    }, [requestTableData]);

    useEffect(() => {
        const loadRoleOptions = async () => {
            try {
                const response = await requestWithAuth(`${API_BASE}/admin/roles`);
                if (!response.ok) {
                    throw new Error(`请求失败(${response.status})`);
                }
                const payload = await response.json();
                if (Array.isArray(payload)) {
                    setRoleOptions(
                        payload
                            .map((item) => ({
                                id: Number(item.id),
                                roleName: String(item.roleName || '')
                            }))
                            .filter((item) => item.id > 0 && item.roleName)
                    );
                }
            } catch (error) {
                console.warn('load role options failed, fallback to mock roles:', error);
            }
        };
        void loadRoleOptions();
    }, []);

    const onSearch = (userName: string) => {
        setQueryParams({ userName });
        setPageNo(1);
    };

    const onPageChange = (nextPageNo: number, nextPageSize: number) => {
        setPageNo(nextPageNo);
        setPageSize(nextPageSize);
    };
    const onAddUser = () => {
        setCurrentUserInfo({});
        setMode('add');
        setIsAddModalOpen(true);
    };
    const onEditUser = (record: UserItem) => {
        setCurrentUserInfo(record);
        setMode('edit');
        setIsAddModalOpen(true);
    };
    const onDeleteUser = (_record: UserItem) => {};

    const closeModal = () => {
        setMode('add');
        setCurrentUserInfo({});
        setIsAddModalOpen(false);
    };

    const onSubmitUser = async (values: UserFormValues, submitMode: 'add' | 'edit') => {
        const userName = values.userName.trim();
        const roleIds = values.roleList;
        if (!userName) {
            message.error('请输入用户名称');
            return;
        }
        if (!Array.isArray(roleIds) || roleIds.length === 0) {
            message.error('请选择用户角色');
            return;
        }

        setSubmitting(true);
        try {
            let response: Response;
            if (submitMode === 'add') {
                response = await requestWithAuth(`${API_BASE}/user`, {
                    method: 'POST',
                    body: JSON.stringify({ userName, roleIds })
                });
            } else {
                if (!currentUserInfo.id) {
                    message.error('缺少用户ID，无法编辑');
                    return;
                }
                response = await requestWithAuth(`${API_BASE}/user/${currentUserInfo.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ userName, roleIds })
                });
            }

            const payload = await response.json().catch(() => ({}));
            if (!response.ok || payload.success === false) {
                throw new Error(payload.message || `请求失败(${response.status})`);
            }

            message.success(submitMode === 'add' ? '新增用户成功' : '编辑用户成功');
            closeModal();
            if (submitMode === 'add') {
                setPageNo(1);
            } else {
                void requestTableData();
            }
        } catch (error) {
            message.error((error as Error).message || '保存用户失败');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card title="用户管理">
            <QueryForm
                onSearch={onSearch}
                onAddUser={onAddUser}
            />
            <DataList
                columns={columns}
                dataSource={users}
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
            <AddUserModal
                mode={mode}
                isOpen={isAddModalOpen}
                currentUserInfo={currentUserInfo}
                roleOptions={roleOptions}
                submitting={submitting}
                onCancel={closeModal}
                onSubmit={onSubmitUser}
            />
        </Card>
    );
}

export default UserManagement;
