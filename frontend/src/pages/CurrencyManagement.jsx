import React from 'react';
import { Card, Table } from 'antd';
import { currencyConfig } from '../config/currencyConfig';

function CurrencyManagement() {
    const columns = [
        {
            title: '货币名称',
            dataIndex: 'label',
            key: 'label',
            align: 'center',
        },
        {
            title: '货币代码',
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
            title: '描述',
            dataIndex: 'desc',
            key: 'desc',
            align: 'center',
        },
    ];
    return (
        <Card title="货币管理">
            <Table
                columns={columns}
                dataSource={currencyConfig}
                rowKey='id'
            />
        </Card>
    );
}

export default CurrencyManagement;
