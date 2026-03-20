export interface UserRoleItem {
    id: number;
    roleName: string;
}

export interface UserItem {
    id: number;
    userName: string;
    createTime: string;
    roleList: UserRoleItem[];
}
