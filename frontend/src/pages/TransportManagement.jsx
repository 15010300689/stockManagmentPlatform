import React from 'react';
import { Card, Table } from 'antd';
import { transportConfig } from '../config/transportConfig';

function TransportManagement() {
    const transportColumns = [
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
            render: (text) => {
                return <div style={{ width: '500px',  whiteSpace: 'wrap',margin: '0 auto' }}>{text}</div>
            }
        },
    ]

    return (
        <Card title="运输途径管理">
            <Table
                columns={transportColumns}
                dataSource={transportConfig}
                rowKey='id'
            />
        </Card>
    );
}

export default TransportManagement;
