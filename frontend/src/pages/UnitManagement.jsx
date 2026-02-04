import React from 'react';
import { Card, Table } from 'antd';
import { unitConfig } from '../config/unitConfig';

function UnitManagement() {
    const columns = [
        {
            title: '计量单位名称',
            dataIndex: 'label',
            key: 'label',
            align: 'center',
        },
        {
            title: '计量单位代码',
            dataIndex: 'code',
            key: 'code',
            align: 'center',
        },
        {
            title: '换算率',
            dataIndex: 'changeRate',
            key: 'changeRate',
            align: 'center',
        },
        {
            title: '对应统计计量单位代码',
            dataIndex: 'relatedCode',
            key: 'relatedCode',
            align: 'center',
        },
    ];
    return (
        <Card title="计量单位管理">
            <Table rowKey={(record) => record.id} columns={columns} dataSource={unitConfig}></Table>
        </Card>
    );
}

export default UnitManagement;
