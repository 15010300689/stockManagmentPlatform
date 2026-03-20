import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UserItem } from '../../types/user';

interface DataListProps {
    tableProps?: TableProps<UserItem>;
    dataSource: UserItem[];
    columns: ColumnsType<UserItem>;
}

function DataList(props: DataListProps): JSX.Element {
    const { tableProps = {}, dataSource, columns } = props;

    return (
        <Table<UserItem>
            style={{ marginTop: 16 }}
            columns={columns}
            rowKey="id"
            dataSource={dataSource}
            {...tableProps}
        />
    );
}

export default DataList;
