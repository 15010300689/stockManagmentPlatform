import React from 'react';
import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { unitConfig } from '../config/unitConfig';
import type { UnitItem } from '../config/unitConfig';

function UnitManagement(): JSX.Element {
    const columns: ColumnsType<UnitItem> = [
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
            <Table<UnitItem> rowKey={(record) => record.id} columns={columns} dataSource={unitConfig} />
        </Card>
    );
}

export default UnitManagement;
