export interface RoleItem {
    id: number;
    roleName: string;
    createTime: string;
    roleMap: string;
    desc: string;
    roleDescription?: string;
    roleDuty?: string;
}

export interface RoleFormValues {
    roleName: string;
    roleDescription?: string;
    roleDuty?: string;
}
