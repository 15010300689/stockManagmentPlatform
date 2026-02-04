package model;

/**
 * 角色实体类
 */
public class Role {
    private int id;
    private String roleName;
    private String desc;

    public Role(int id, String roleName, String desc) {
        this.id = id;
        this.roleName = roleName;
        this.desc = desc;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }
}
