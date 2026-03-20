import React, { useState, useMemo, useEffect } from 'react';
import { Card, Space, Button, Tag, Row, Col, Typography, Empty, Statistic } from 'antd';
import {
    HomeOutlined,
    AppstoreOutlined,
    BarsOutlined,
    ContainerOutlined,
    EditOutlined,
    DeleteOutlined,
    DownOutlined,
    RightOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface TreeNode {
    id: number;
    code: string;
    name?: string;
    type: string;
    typeLabel: string;
    status: string;
    maxCapacity?: number;
    unit?: string;
    children?: TreeNode[];
}

interface DataListProps {
    treeData?: TreeNode[];
    onEdit?: (node: TreeNode) => void;
    onDelete?: (node: TreeNode) => void;
}

function DataList(props: DataListProps): JSX.Element {
    const { treeData = [], onEdit, onDelete } = props;
    const [expandedKeys, setExpandedKeys] = useState<Record<number, boolean>>({});

    // 初始化展开状态：默认展开第一层
    useEffect(() => {
        const keys: Record<number, boolean> = {};
        treeData.forEach(node => {
            if (node.children && node.children.length > 0) {
                keys[node.id] = true;
            }
        });
        setExpandedKeys(keys);
    }, [treeData]);

    // 获取层级图标
    const getTypeIcon = (type: string) => {
        const iconMap: Record<string, JSX.Element> = {
            area: <HomeOutlined style={{ fontSize: 18, color: '#1890ff' }} />,
            shelf: <AppstoreOutlined style={{ fontSize: 16, color: '#52c41a' }} />,
            level: <BarsOutlined style={{ fontSize: 16, color: '#faad14' }} />,
            position: <ContainerOutlined style={{ fontSize: 16, color: '#722ed1' }} />
        };
        return iconMap[type] || <ContainerOutlined />;
    };

    // 获取层级边框色
    const getTypeBorderColor = (type: string) => {
        const colorMap: Record<string, string> = {
            area: '#1890ff',
            shelf: '#52c41a',
            level: '#faad14',
            position: '#722ed1'
        };
        return colorMap[type] || '#d9d9d9';
    };

    // 渲染单个节点卡片
    const renderNodeCard = (node: TreeNode, level = 0): JSX.Element => {
        const isExpanded = expandedKeys[node.id];
        const hasChildren = !!(node.children && node.children.length > 0);
        const marginLeft = level * 32;
        const borderLeftWidth = level > 0 ? 3 : 0;

        return (
            <div key={node.id} style={{ marginBottom: 16, marginLeft, position: 'relative' }}>
                {level > 0 && (
                    <div
                        style={{
                            position: 'absolute',
                            left: -16,
                            top: 0,
                            bottom: 0,
                            width: 2,
                            background: 'linear-gradient(to bottom, #d9d9d9, transparent)',
                        }}
                    />
                )}
                <Card
                    size="small"
                    style={{
                        borderRadius: 8,
                        border: `2px solid ${getTypeBorderColor(node.type)}`,
                        borderLeftWidth: borderLeftWidth || 2,
                        boxShadow: level === 0 ? '0 2px 8px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s',
                        background: '#fff',
                        padding: '16px 20px'
                    }}
                    hoverable
                >
                    <Row align="middle" gutter={16}>
                        <Col flex="auto">
                            <Space size="middle" align="center">
                                {getTypeIcon(node.type)}
                                <div>
                                    <div style={{ marginBottom: 4 }}>
                                        <Text strong style={{ fontSize: 15 }}>
                                            {node.code}
                                        </Text>
                                        {node.name && node.code !== node.name && (
                                            <Text type="secondary" style={{ marginLeft: 8, fontSize: 13 }}>
                                                {node.name}
                                            </Text>
                                        )}
                                    </div>
                                    <Space size="small" style={{ marginTop: 4 }}>
                                        <Tag
                                            color={node.status === '1' ? 'success' : 'error'}
                                            style={{ margin: 0 }}
                                        >
                                            {node.status === '1' ? '启用' : '停用'}
                                        </Tag>
                                        <Tag color="processing" style={{ margin: 0 }}>
                                            {node.typeLabel}
                                        </Tag>
                                        {node.maxCapacity && (
                                            <Tag color="default" style={{ margin: 0 }}>
                                                容量: {node.maxCapacity} {node.unit || ''}
                                            </Tag>
                                        )}
                                    </Space>
                                </div>
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                {hasChildren && (
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                                        onClick={() => {
                                            setExpandedKeys(prev => ({
                                                ...prev,
                                                [node.id]: !prev[node.id]
                                            }));
                                        }}
                                    >
                                        {isExpanded ? '收起' : '展开'}
                                    </Button>
                                )}
                                <Button
                                    type="link"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => onEdit && onEdit(node)}
                                >
                                    编辑
                                </Button>
                                <Button
                                    type="link"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => onDelete && onDelete(node)}
                                >
                                    删除
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* 渲染子节点 */}
                {hasChildren && isExpanded && (
                    <div style={{ marginTop: 12 }}>
                        {node.children!.map(child => renderNodeCard(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    // 统计各层级数量
    const countByType = useMemo(() => {
        const count: Record<string, number> = { area: 0, shelf: 0, level: 0, position: 0 };
        const traverse = (nodes: TreeNode[]) => {
            nodes.forEach(node => {
                if (Object.prototype.hasOwnProperty.call(count, node.type)) {
                    count[node.type]++;
                }
                if (node.children && node.children.length > 0) {
                    traverse(node.children);
                }
            });
        };
        traverse(treeData);
        return count;
    }, [treeData]);

    // 如果没有数据，显示空状态
    if (!treeData || treeData.length === 0) {
        return (
            <div style={{ marginTop: 16, padding: '40px 0' }}>
                <Empty description="暂无仓位数据" />
            </div>
        );
    }

    return (
        <div style={{ marginTop: 16 }}>
            {/* 统计信息卡片 */}
            <Card
                size="small"
                style={{
                    marginBottom: 16,
                    background: 'rgb(19, 194, 194)',
                    borderRadius: 8,
                    padding: '16px 24px'
                }}
            >
                <Row gutter={24}>
                    <Col span={6}>
                        <Statistic
                            title={<span style={{ color: '#fff' }}>库区</span>}
                            value={countByType.area}
                            style={{ color: '#fff', fontSize: 24 }}
                            prefix={<HomeOutlined style={{ color: '#fff' }} />}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title={<span style={{ color: '#fff' }}>货架</span>}
                            value={countByType.shelf}
                            style={{ color: '#fff', fontSize: 24 }}
                            prefix={<AppstoreOutlined style={{ color: '#fff' }} />}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title={<span style={{ color: '#fff' }}>层</span>}
                            value={countByType.level}
                            style={{ color: '#fff', fontSize: 24 }}
                            prefix={<BarsOutlined style={{ color: '#fff' }} />}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title={<span style={{ color: '#fff' }}>仓位</span>}
                            value={countByType.position}
                            style={{ color: '#fff', fontSize: 24 }}
                            prefix={<ContainerOutlined style={{ color: '#fff' }} />}
                        />
                    </Col>
                </Row>
            </Card>

            {/* 仓位树形列表 */}
            <div>
                {treeData.map(node => renderNodeCard(node, 0))}
            </div>
        </div>
    );
}

export default DataList;
