import React from 'react';
import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { transportConfig } from '../config/transportConfig';
import type { TransportItem } from '../config/transportConfig';

function TransportManagement(): JSX.Element {
    const transportColumns: ColumnsType<TransportItem> = [
        {
            title: '运输方式',
            dataIndex: 'label',
            key: 'label',
            align: 'center',
            width: '160'
        },
        {
            title: '运输方式代码',
            dataIndex: 'code',
            key: 'code',
            align: 'center',
            width: '300'
        },
        {
            title: '换算率',
            dataIndex: 'changeRate',
            key: 'changeRate',
            align: 'center',
        },
        {
            title: '描述',
            dataIndex: 'desc',
            key: 'desc',
            align: 'center',
            render: (text: string) => {
                return <div style={{ width: '500px', whiteSpace: 'wrap', margin: '0 auto' }}>{text}</div>;
            }
        },
    ];

    return (
        <Card title="运输途径管理">
            <Table<TransportItem>
                columns={transportColumns}
                dataSource={transportConfig}
                rowKey="id"
            />
        </Card>
    );
}

export default TransportManagement;
