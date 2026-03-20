import React from 'react';
import { Modal, Button, Statistic, Row, Col, Divider, Space, Tag } from 'antd';
import type { Stats } from '../../types/inventory';

interface StatisticsModalProps {
    visible: boolean;
    onClose: () => void;
    stats: Stats;
}

function StatisticsModal({ visible, onClose, stats }: StatisticsModalProps): JSX.Element {
    return (
        <Modal
            title="📊 库存统计"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    关闭
                </Button>
            ]}
            width={600}
        >
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={12}>
                    <Statistic title="商品种类数" value={stats.productCount} />
                </Col>
                <Col span={12}>
                    <Statistic
                        title="库存总价值"
                        value={stats.totalValue}
                        precision={2}
                        prefix="¥"
                    />
                </Col>
            </Row>
            <Divider />
            <div>
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>商品类别:</div>
                <Space wrap>
                    {stats.categories && stats.categories.map((cat, index) => (
                        <Tag key={index} color="blue">{cat}</Tag>
                    ))}
                </Space>
            </div>
        </Modal>
    );
}

export default StatisticsModal;
