import type { UserItem } from '../types/user';

export const userList: UserItem[] = [
    {
        id: 1,
        userName: '张三',
        createTime: '2026-2-4',
        roleList: [
            {
                id: 1,
                roleName: '系统管理员'
            }
        ]
    },
    {
        id: 2,
        userName: '李四',
        createTime: '2026-2-4',
        roleList: [
            {
                id: 1,
                roleName: '系统管理员'
            },
            {
                id: 2,
                roleName: '库存管理员'
            },
            {
                id: 3,
                roleName: '库存操作员'
            }
        ]
    }
];
