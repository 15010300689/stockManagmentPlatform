import React, { useState } from 'react';
import { Card, Space, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import QueryForm from '../components/UserManagement/QueryForm';
import DataList from '../components/UserManagement/DataList';
import AddUserModal from '../components/UserManagement/AddUserModal';

import { userList } from '../mock/userList';
import RenderOverTag from '../components/RenderOverTag';
import type { UserItem } from '../types/user';

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

    const onSearch = (userName: string) => {
        setQueryParams({ userName });
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

    const filteredData = userList.filter(item => {
        if (!queryParams.userName) return true;
        return item.userName.includes(queryParams.userName);
    });

    return (
        <Card title="用户管理">
            <QueryForm
                onSearch={onSearch}
                onAddUser={onAddUser}
            />
            <DataList
                columns={columns}
                dataSource={filteredData}
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
