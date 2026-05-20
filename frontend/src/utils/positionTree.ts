/** 仓位树节点（供 TreeSelect 使用） */
export interface PositionTreeNode {
    id: number;
    title: string;
    value: number;
    children?: PositionTreeNode[];
}

export interface PositionLike {
    id: number;
    warehouseId: number;
    parentId?: number | null;
    code: string;
    name?: string;
}

/** 后端 JSON 可能省略 null 字段，统一视为根节点 */
export function normalizeParentId(parentId?: number | null): number | null {
    return parentId == null ? null : Number(parentId);
}

/**
 * 按仓库、父节点构建仓位树
 */
export function buildPositionTree(
    positions: PositionLike[],
    warehouseId?: number | null,
    parentId: number | null = null
): PositionTreeNode[] {
    const whId = warehouseId != null ? Number(warehouseId) : null;
    if (!whId) {
        return [];
    }
    return positions
        .filter((item) => {
            if (Number(item.warehouseId) !== whId) {
                return false;
            }
            const itemParent = normalizeParentId(item.parentId);
            const targetParent = normalizeParentId(parentId);
            return itemParent === targetParent;
        })
        .map((item) => {
            const children = buildPositionTree(positions, warehouseId, item.id);
            return {
                id: item.id,
                title: `${item.code}${item.name ? ` - ${item.name}` : ''}`,
                value: item.id,
                children: children.length > 0 ? children : undefined,
            };
        });
}
