import React, { useCallback, useEffect, useState } from 'react';
import { Card, Space, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import QueryForm from '../components/UserManagement/QueryForm';
import DataList from '../components/UserManagement/DataList';
import AddUserModal from '../components/UserManagement/AddUserModal';
import { authFetch } from '../auth';

import { userList } from '../mock/userList';
import RenderOverTag from '../components/RenderOverTag';
import type { UserItem } from '../types/user';

const API_BASE = '/api';

interface UserListResponse {
    data?: UserItem[];
    total?: number;
    pageNo?: number;
    pageSize?: number;
}

function UserManagement(): JSX.Element {
    const columns: ColumnsType<UserItem> = [
        {
            title: '用户ID',
            dataIndex: 'id',
            key: 'id',
            width: '160',
            align: 'center',
            fixed: 'left',
        },
        {
            title: '用户名称',
            dataIndex: 'userName',
            key: 'name',
            align: 'center',
            fixed: 'left',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            align: 'center',
        },
        {
            title: '角色',
            dataIndex: 'roleList',
            key: 'roleList',
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
            const response = await authFetch(`${API_BASE}/users?${params.toString()}`);
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
                onCancel={() => {
                    setMode('add');
                    setCurrentUserInfo({});
                    setIsAddModalOpen(false);
                }}
                onUpdate={() => {}}
            />
        </Card>
    );
}

export default UserManagement;
