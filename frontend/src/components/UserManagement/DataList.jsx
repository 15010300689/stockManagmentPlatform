import React from 'react';
import { Table } from 'antd';
function DataList(props) {
    const { tableProps = {}, dataSource } = props;

    return (
        <Table
            // scroll={{ x: "max-content" }}
            style={{ marginTop: 16 }}
            columns={props.columns}
            rowKey='id'
            dataSource={dataSource}
            {...tableProps}
        />
    );
}

export default DataList;