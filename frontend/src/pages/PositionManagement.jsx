import React, { useState, useEffect, useMemo } from 'react';
import { Card, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import QueryForm from '../components/PositionManagement/QueryForm';
import DataList from '../components/PositionManagement/DataList';
import AddPositionModal from '../components/PositionManagement/AddPositionModal';
import { positionList } from '../mock/positionList';
import { storeList } from '../mock/storeList';

function PositionManagement() {
    const [searchParams] = useSearchParams();
    const warehouseIdFromUrl = searchParams.get('warehouseId');
    const warehouseNameFromUrl = searchParams.get('warehouseName');

    const [queryParams, setQueryParams] = useState({
        warehouseId: warehouseIdFromUrl || '',
        code: '',
        type: '',
        status: ''
    });

    const [mode, setMode] = useState('add');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentPositionInfo, setCurrentPositionInfo] = useState({});
    const [dataSource, setDataSource] = useState(positionList);

    // 构建树状结构
    const buildTree = (data, parentId = null) => {
        return data
            .filter(item => {
                // 先匹配父节点关系
                const matchParent = (item.parentId === null && parentId === null) || 
                                   (item.parentId !== null && item.parentId === parentId) ||
                                   (item.parentId !== null && parentId !== null && String(item.parentId) === String(parentId));
                
                if (!matchParent) return false;
                
                // 应用筛选条件
                const matchWarehouse = !queryParams.warehouseId || item.warehouseId === parseInt(queryParams.warehouseId);
                const matchCode = !queryParams.code || item.code.toLowerCase().includes(queryParams.code.toLowerCase());
                const matchType = !queryParams.type || item.type === queryParams.type;
                const matchStatus = !queryParams.status || item.status === queryParams.status;
                
                return matchWarehouse && matchCode && matchType && matchStatus;
            })
            .map(item => {
                const typeLabels = {
                    'area': '库区',
                    'shelf': '货架',
                    'level': '层',
                    'position': '仓位'
                };
                
                const children = buildTree(data, item.id);
                return {
                    id: item.id,
                    title: `${item.code} - ${item.name || ''}`,
                    type: item.type,
                    typeLabel: typeLabels[item.type] || item.type,
                    status: item.status,
                    warehouseId: item.warehouseId,
                    parentId: item.parentId,
                    code: item.code,
                    maxCapacity: item.maxCapacity,
                    unit: item.unit,
                    children: children.length > 0 ? children : undefined
                };
            });
    };

    const treeData = useMemo(() => {
        return buildTree(dataSource);
    }, [dataSource, queryParams]);

    const onSearch = (values) => {
        setQueryParams({
            warehouseId: values.warehouseId || '',
            code: values.code || '',
            type: values.type || '',
            status: values.status || ''
        });
    };

    const onAddPosition = () => {
        setCurrentPositionInfo({});
        setMode('add');
        setIsAddModalOpen(true);
    };

    const onEditPosition = (record) => {
        setCurrentPositionInfo(record);
        setMode('edit');
        setIsAddModalOpen(true);
    };

    const onDeletePosition = (record) => {
        // TODO: 实现删除逻辑
        message.info('删除功能待实现');
    };

    const handleSubmit = async (values, mode) => {
        try {
            // TODO: 调用API保存数据
            if (mode === 'add') {
                const newPosition = {
                    id: Date.now(),
                    ...values,
                    name: values.code, // 默认名称使用编码
                    createTime: new Date().toLocaleDateString()
                };
                setDataSource([...dataSource, newPosition]);
                message.success('新增仓位成功');
            } else {
                const updatedData = dataSource.map(item => 
                    item.id === currentPositionInfo.id 
                        ? { ...item, ...values, name: values.code }
                        : item
                );
                setDataSource(updatedData);
                message.success('编辑仓位成功');
            }
            setIsAddModalOpen(false);
            setCurrentPositionInfo({});
        } catch (error) {
            message.error('操作失败: ' + error.message);
        }
    };

    // 初始化时如果有URL参数，设置仓库筛选
    useEffect(() => {
        if (warehouseIdFromUrl) {
            setQueryParams(prev => ({
                ...prev,
                warehouseId: warehouseIdFromUrl
            }));
        }
    }, [warehouseIdFromUrl]);

    return (
        <Card title={warehouseNameFromUrl ? `仓位管理 - ${decodeURIComponent(warehouseNameFromUrl)}` : '仓位管理'}>
            <QueryForm
                warehouseList={storeList}
                onSearch={onSearch}
                onAddPosition={onAddPosition}
            />
            <DataList
                treeData={treeData}
                onEdit={onEditPosition}
                onDelete={onDeletePosition}
            />
            <AddPositionModal
                mode={mode}
                isOpen={isAddModalOpen}
                currentPositionInfo={currentPositionInfo}
                warehouseList={storeList}
                positionTree={dataSource}
                onCancel={() => {
                    setMode('add');
                    setCurrentPositionInfo({});
                    setIsAddModalOpen(false);
                }}
                onSubmit={handleSubmit}
            />
        </Card>
    );
}

export default PositionManagement;
