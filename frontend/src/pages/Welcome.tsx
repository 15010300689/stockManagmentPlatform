import React from 'react';
import { Card, Col, Row, Statistic, Typography, Descriptions } from 'antd';
import { getUsername, getRoles } from '../auth';

function Welcome(): JSX.Element {
    const username = getUsername() || '用户';
    const roles = getRoles();

    return (
        <Card title="欢迎页">
            <Typography.Paragraph style={{lineHeight: '36px', paddingLeft: '16px'}}>
                欢迎回来，{username}。你可以通过左侧菜单进入业务模块进行操作。<br />如遇功能异常、权限疑问或技术支持需求，请联系系统管理员解决。
            </Typography.Paragraph>
            <Row gutter={[16, 16]}>
                <Col  xs={24} lg={24}>
                    <Card>
                        <Descriptions title="" column={1}>
                            <Descriptions.Item label="账号名称">{username}</Descriptions.Item>
                            <Descriptions.Item label="当前角色">{roles.map(role => role.roleName).join(',')}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
                
            </Row>
        </Card>
    );
}

export default Welcome;
