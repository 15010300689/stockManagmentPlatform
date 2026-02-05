import React, { useState } from 'react';
import { Card, Space, Button, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import QueryForm from '../components/StoreManagement/QueryForm';
import DataList from '../components/StoreManagement/DataList';
import AddStoreModal from '../components/StoreManagement/AddStoreModal';
import { storeList } from '../mock/storeList';

function StoreManagement() {
    const navigate = useNavigate();
    const [queryParams, setQueryParams] = useState({
        keyword: '',
        status: ''
    });

    const [mode, setMode] = useState('add'); // 'add' or 'edit'
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentStoreInfo, setCurrentStoreInfo] = useState({});
    const [dataSource, setDataSource] = useState(storeList);

    // 过滤数据
    const filteredData = dataSource.filter(item => {
        const matchKeyword = !queryParams.keyword || 
            item.code.toLowerCase().includes(queryParams.keyword.toLowerCase()) ||
            item.name.toLowerCase().includes(queryParams.keyword.toLowerCase());
        const matchStatus = !queryParams.status || item.status === queryParams.status;
        return matchKeyword && matchStatus;
    });

    const columns = [
        {
            title: '仓库编码',
            dataIndex: 'code',
            key: 'code',
            width: 120,
            align: 'center',
            fixed: 'left',
        },
        {
            title: '仓库名称',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            fixed: 'left',
        },
        {
            title: '仓库地址',
            dataIndex: 'address',
            key: 'address',
            align: 'center',
        },
        {
            title: '联系人',
            dataIndex: 'contact',
            key: 'contact',
            align: 'center',
        },
        {
            title: '联系电话',
            dataIndex: 'phone',
            key: 'phone',
            align: 'center',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => (
                <Tag color={status === '1' ? 'green' : 'red'}>
                    {status === '1' ? '启用' : '停用'}
                </Tag>
            )
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            align: 'center',
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            width: 200,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="link" 
                        size="small" 
                        onClick={() => handleView(record)}
                    >
                        查看
                    </Button>
                    <Button 
                        type="link" 
                        size="small" 
                        onClick={() => onEditStore(record)}
                    >
                        编辑
                    </Button>
                    <Button 
                        type="link" 
                        size="small" 
                        danger
                        onClick={() => onDeleteStore(record)}
                    >
                        删除
                    </Button>
                </Space>
            ),
        }
    ];

    const onSearch = (values) => {
        setQueryParams({
            keyword: values.keyword || '',
            status: values.status || ''
        });
    };

    const onAddStore = () => {
        setCurrentStoreInfo({});
        setMode('add');
        setIsAddModalOpen(true);
    };

    const onEditStore = (record) => {
        setCurrentStoreInfo(record);
        setMode('edit');
        setIsAddModalOpen(true);
    };

    const onDeleteStore = (record) => {
        // TODO: 实现删除逻辑
        message.info('删除功能待实现');
    };

    const handleView = (record) => {
        // 跳转到仓位管理页，并将该仓库作为筛选条件
        navigate(`/positionManagement?warehouseId=${record.id}&warehouseName=${encodeURIComponent(record.name)}`);
    };

    const handleSubmit = async (values, mode) => {
        try {
            // TODO: 调用API保存数据
            if (mode === 'add') {
                const newStore = {
                    id: Date.now(),
                    ...values,
                    createTime: new Date().toLocaleDateString()
                };
                setDataSource([...dataSource, newStore]);
                message.success('新增仓库成功');
            } else {
                const updatedData = dataSource.map(item => 
                    item.id === currentStoreInfo.id 
                        ? { ...item, ...values }
                        : item
                );
                setDataSource(updatedData);
                message.success('编辑仓库成功');
            }
            setIsAddModalOpen(false);
            setCurrentStoreInfo({});
        } catch (error) {
            message.error('操作失败: ' + error.message);
        }
    };

    return (
        <Card title="仓库管理">
            <QueryForm
                onSearch={onSearch}
                onAddStore={onAddStore}
            />
            <DataList
                columns={columns}
                dataSource={filteredData}
            />
            <AddStoreModal
                mode={mode}
                isOpen={isAddModalOpen}
                currentStoreInfo={currentStoreInfo}
                onCancel={() => {
                    setMode('add');
                    setCurrentStoreInfo({});
                    setIsAddModalOpen(false);
                }}
                onSubmit={handleSubmit}
            />
        </Card>
    );
}

export default StoreManagement;
