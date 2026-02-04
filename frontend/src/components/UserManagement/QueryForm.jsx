import React from 'react';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input, Button } from 'antd';
function QueryForm(props) {
    const [form] = Form.useForm();
    return (
        <Form layout="inline">
            <Form.Item label="" name="userName">
                <Input.Search
                    allowClear
                    enterButton={<SearchOutlined />}
                    placeholder="请输入用户名称"
                    onSearch={props.onSearch}
                 />
            </Form.Item>
            <Form.Item>
                <Button 
                    icon={<PlusOutlined />}
                    color="primary"
                    variant="outlined"
                    onClick={props.onAddUser}>
                        添加用户
                </Button>
            </Form.Item>
        </Form>
    );
}

export default QueryForm;