import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { StoreItem } from '../../types/inventory';

interface DataListProps {
    tableProps?: TableProps<StoreItem>;
    dataSource: StoreItem[];
    columns: ColumnsType<StoreItem>;
}

function DataList(props: DataListProps): JSX.Element {
    const { tableProps = {}, dataSource, columns } = props;

    return (
        <Table<StoreItem>
            scroll={{ x: 'max-content' }}
            style={{ marginTop: 16 }}
            columns={columns}
            rowKey="id"
            dataSource={dataSource}
            {...tableProps}
        />
    );
}

export default DataList;
