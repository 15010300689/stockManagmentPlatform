import { useEffect, useRef, useState } from 'react';
import type { DependencyList } from 'react';
import type { TableProps, TablePaginationConfig } from 'antd';
import { notifyErrorOnce } from '../http';

interface PageParams {
    pageNum: number;
    pageSize: number;
}

interface RequestResult<T> {
    data?: T[];
    total?: number;
}

interface UseAntdTableOptions {
    isInit?: boolean;
}

interface UseAntdTableParams<T> {
    requestFunction: (params: PageParams) => Promise<RequestResult<T> | void>;
    deps?: DependencyList;
    tableProps?: TableProps<T>;
    options?: UseAntdTableOptions;
}

export default function useAntdTable<T>({
    requestFunction,
    deps = [],
    tableProps = {},
    options = {}
}: UseAntdTableParams<T>) {
    const [dataList, setDataList] = useState<T[]>([]);
    const defaultPageSize = (
        typeof tableProps.pagination === 'object' &&
        tableProps.pagination?.defaultPageSize
    ) || 10;

    const [pageParams, setPageParams] = useState<PageParams>({
        pageNum: 1,
        pageSize: defaultPageSize,
    }); // 当前页码及每页条数
    const [total, setTotal] = useState(0); // 数据总条数
    const [isFetching, setIsFetching] = useState(false); // 是否处于请求中
    const isInitFlagRef = useRef(true); // 标示下是否是首次初始化渲染
    const { isInit = true } = options;
    const stopInitReq = useRef(isInit === false);

    // 依赖项变化，重置分页
    useEffect(() => {
        const isNeedReset = isInitFlagRef.current === false; // 只在更新场景才调用重置，首次初始化不需要
        if (isNeedReset) {
            setPageParams(prev => ({
                ...prev,
                pageNum: 1,
            }));
        }
    }, deps);

    // 分页请求
    useEffect(() => {
        if (stopInitReq.current) { // isInit 选项为 false，禁止初始化时请求列表
            stopInitReq.current = false;
            return;
        }
        fetchTableData();
    }, [pageParams]);

    const onChange: TableProps<T>['onChange'] = (pagination) => {
        const current = pagination?.current || 1;
        const pageSize = pagination?.pageSize || pageParams.pageSize;
        setPageParams(prev => ({
            pageNum: pageSize === prev.pageSize ? current : 1,
            pageSize,
        }));
    };

    const fetchTableData = async () => {
        try {
            setIsFetching(true);
            const res = await requestFunction(pageParams);
            const { data, total: listTotal } = res || {};
            setDataList(data || []);
            setTotal(listTotal || 0);
        } catch (error: unknown) {
            notifyErrorOnce(error, { fallback: '加载列表出错' });
        } finally {
            isInitFlagRef.current = false;
            setIsFetching(false);
        }
    };

    return {
        tableProps: {
            ...tableProps,
            loading: isFetching,
            onChange,
            dataSource: dataList,
            pagination: tableProps.pagination !== false && {
                ...(tableProps.pagination as TablePaginationConfig),
                current: pageParams.pageNum,
                pageSize: pageParams.pageSize,
                total,
            },
        } as TableProps<T>,
        resetTable() {
            setPageParams(prev => ({
                ...prev,
                pageNum: 1,
            }));
            setTotal(0);
            setDataList([]);
        },
        reloadTable() {
            fetchTableData();
            setTotal(0);
            setDataList([]);
        },
    };
}
