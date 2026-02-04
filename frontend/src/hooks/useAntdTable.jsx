import React, { useEffect, useState, useRef } from 'react';
import { message } from 'antd';
export default function useAntdTable({
    requestFunction,
    deps = [],
    tableProps = {},
    options = {}
}) {
    const [dataList, setDataList] = React.useState([]);
    const defaultPageSize = (tableProps?.pagination && tableProps?.pagination.defaultPageSize) || 10;
    const [pageParams, setPageParams] = useState({
        pageNum: 1,
        pageSize: defaultPageSize,
    }); // 当前页码及每页条数
    const [total, setTotal] = useState(0); // 数据总条数
    const [isFetching, setIsFetching] = useState(false); // 是否处于请求中
    const isInitFlagRef = useRef(true); // 标示下是否是首次初始化渲染
    const { isInit = true } = options || {};
    const stopInitReq = useRef(isInit === false);

    // 依赖项变化，重置分页
    useEffect(() => {
        const isNeedRest = isInitFlagRef.current === false; // 只在更新场景才调用重置，首次初始化不需要

        isNeedRest && setPageParams({
            ...pageParams,
            pageNum: 1,
        });
    }, deps)

    // 分页请求
    useEffect(() => {
        if (stopInitReq.current) { // isInit选项为true,禁止初始化时候去请求列表
            stopInitReq.current = false;

            return;
        }

        fetchTableData();
    }, [pageParams]);

    const onChange = ({ current, pageSize }) => {
        setPageParams({
            pageNum: pageSize === pageParams.pageSize ? current : 1,
            pageSize,
        });
    };

    const fetchTableData = async (params = {}) => {
        try {
            setIsFetching(true);
            const { data, total } = (await requestFunction(pageParams)) || {};
            setDataList(data || []);
            setTotal(total || 0);
        } catch (error) {
            message.error(error.message || error.msg || '加载列表出错');
        }

        isInitFlagRef.current = false;
        setIsFetching(false);
    }

    return {
        tableProps: {
            ...tableProps,
            loading: isFetching,
            onChange,
            dataSource: dataList,
            pagination: tableProps.pagination !== false && {
                ...tableProps.pagination,
                current: pageParams.pageNum,
                pageSize: pageParams.pageSize,
                total,
            },
        },
        resetTable() {
            setPageParams({
                ...pageParams,
                pageNum: 1,
            });
            setTotal(0);
            setDataList([]);
        },
        reloadTable() {
            fetchTableData();
            setTotal(0);
            setDataList([]);
        },
    }
}