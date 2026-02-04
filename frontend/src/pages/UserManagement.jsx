import React, { useState } from 'react';
import { Card, Tag, Space, Button } from 'antd';
import QueryForm from '../components/UserManagement/QueryForm';
import DataList from '../components/UserManagement/DataList';
import AddUserModal from '../components/UserManagement/AddUserModal';

import { userList } from '../mock/userList';
import RenderOverTag from '../components/RenderOverTag/index';

function UserManagement() {
    const columns = [
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

            render: (roles) => (
                RenderOverTag(roles.map(item => {
                    return {
                        id: item.id,
                        name: item.roleName
                    }
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
    ]

    const [queryParams, setQueryParams] = useState({
        userName: '',
        roleList: ''
    });
    
    const [mode, setMode] = useState('add'); // 'add' or 'edit'
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentUserInfo, setCurrentUserInfo] = useState({});

    const onSearch = () => {}
    const onAddUser = () => {
        setCurrentUserInfo({});
        setMode('add');
        setIsAddModalOpen(true);
    }
    const onEditUser = (record) => {
        setCurrentUserInfo(record);
        setMode('edit');
        setIsAddModalOpen(true);
    }
    const onDeleteUser = (record) => {}

    return (
        <Card title="用户管理">
            <QueryForm 
                onSearch={onSearch}
                onAddUser={onAddUser} />
            <DataList
                columns={columns}
                dataSource={userList} />
            <AddUserModal
                isOpen={isAddModalOpen}
                currentUserInfo={currentUserInfo}
                onCancel={() => {
                    setMode('')
                    setCurrentUserInfo({});
                    setIsAddModalOpen(false)
                }}
                onUpdate={() => {}}/>
        </Card>
    );
}

export default UserManagement;

