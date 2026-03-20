import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { RoleItem } from '../../types/role';

interface DataListProps {
    tableProps?: TableProps<RoleItem>;
    dataSource: RoleItem[];
    columns: ColumnsType<RoleItem>;
}

function DataList(props: DataListProps): JSX.Element {
    const { tableProps = {}, dataSource, columns } = props;

    return (
        <Table<RoleItem>
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
