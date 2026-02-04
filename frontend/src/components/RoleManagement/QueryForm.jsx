import React from 'react';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input, Button } from 'antd';
function QueryForm(props) {
    const [form] = Form.useForm();
    return (
        <Form layout="inline">
            <Form.Item label="角色名称" name="roleName">
                <Input.Search
                    allowClear
                    enterButton={<SearchOutlined />}
                    placeholder="请输入角色名称"
                    onSearch={props.onSearch}
                 />
            </Form.Item>
            <Form.Item>
                <Button 
                    icon={<PlusOutlined />}
                    color="primary"
                    variant="outlined"
                    onClick={props.onAddRole}>
                        添加角色
                </Button>
            </Form.Item>
        </Form>
    );
}

export default QueryForm;