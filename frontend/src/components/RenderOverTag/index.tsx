import { Space, Tag, Popover } from 'antd';
import './index.scss';

interface RenderTagItem {
    id: number | string;
    name: string;
}

function RenderOverTag(tagList: RenderTagItem[] = []): JSX.Element {
    if (!tagList || tagList.length === 0) return <span>-</span>;

    const tags = tagList.map(tag => (
        <Tag key={tag.id} color="blue" style={{ marginRight: 4 }}>{tag.name}</Tag>
    ));

    const content = (
        <div style={{ maxWidth: 300 }}>
            <Space size={[0, 8]} wrap>
                {tags}
            </Space>
        </div>
    );

    return (
        <Popover content={content} trigger="hover" placement="topLeft">
            <div className="ellipsis-container">
                {tags}
            </div>
        </Popover>
    );
}

export default RenderOverTag;
