import React, { useState } from 'react';
import { Card, Space, Button } from 'antd';

import QueryForm from '../components/RoleManagement/QueryForm';
import DataList from '../components/RoleManagement/DataList';
import AddRoleModal from '../components/RoleManagement/AddRoleModal';

import { roleList } from '../mock/roleList'
import useAntdTable from '../hooks/useAntdTable';
import { fetchRoles } from '../api/roleManagement';



function RoleManagement() {
    const [queryParams, setQueryParams] = useState({
        roleName: '',
    });

    const [mode, setMode] = useState('add'); // 'add' or 'edit'
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentRoleInfo, setCurrentRoleInfo] = useState({});

    const requestTableData = async () => {
        try {
            const { roleName } = queryParams;
            const { data, total } = await fetchRoles({ roleName  });

            return {
                data,
                total,
            }
        } catch (e) {
            console.error(e);
        }
    }

    // const { tableProps, resetTable, reloadTable } = useAntdTable({
    //     requestFunction:requestTableData,
    //     deps: [queryParams],
    //     options: {
    //         isInit: false,
    //     }
    // })


    const columns = [
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
            render: (text) => (
                <ul>
                    {
                        text.split('、').map(item => <li key={item}>{item}</li>)
                    }
                </ul>
            )
        },
        {
            title: '典型权限',
            dataIndex: 'roleMap',
            key: 'roleMap',
            render: (text) => (
                <ul>
                    {
                        text.split('、').map(item => <li key={item}>{item}</li>)
                    }
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
    ]

    const onSearch = (value) => {
        const { roleName } = value;
        setQueryParams({roleName})
    };
    const onAddRole = () => {
        setCurrentRoleInfo({});
        setMode('add');
        setIsAddModalOpen(true);

    };
    const onEditRole = (record) => {
        console.log(record);
        setCurrentRoleInfo(record);
        setMode('edit');
        setIsAddModalOpen(true);
    };
    const onDeleteRole = (record) => {};

    return (
        <Card title="角色管理">
            <QueryForm
                onSearch={onSearch}
                onAddRole={onAddRole}
             />
            <DataList
                columns={columns}
                dataSource={roleList}
                // tableProps={tableProps}
             />
            <AddRoleModal
                mode={mode} 
                isOpen={isAddModalOpen}
                currentRoleInfo={currentRoleInfo}
                onCancel={
                    () => {
                        setMode('')
                        setCurrentRoleInfo({});
                        setIsAddModalOpen(false)
                    }
                }
                onUpdate={
                    () => {
                        reloadTable();
                    }
                }
             />
        </Card>
    );
}

export default RoleManagement;

