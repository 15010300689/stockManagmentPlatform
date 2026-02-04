import { Space, Tag, Popover } from 'antd';
import './index.scss'

function RenderOverTag(tagList = []){
    if(!tagList || tagList.length ===0) return <span>-</span>;

    const Tags = tagList.map(tag => (
        <Tag key={tag.id} color="blue" variants="outlined" style={{marginRight: 4}}>{tag.name}</Tag>
    ))
    const content = (
        <div style={{ maxWidth: 300 }}>
            <Space size={[0, 8]} wrap>
            { Tags }
            </Space>
        </div>
    );

    return (
        <Popover content={content} trigger="hover" placement="topLeft">
            <div className="ellipsis-container">
                {Tags}
            </div>
        </Popover>
    );

}
export default RenderOverTag