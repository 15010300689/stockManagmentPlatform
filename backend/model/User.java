package model;

import java.util.List;
import java.util.ArrayList;

/**
 * 用户实体类
 */
public class User {
    private String username;
    private String password;
    private List<Role> roles;

    public User(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.roles = new ArrayList<>();

        switch (role) {
            case "admin":
                roles.add(new Role(1, "admin", "管理员角色"));
                break;
            case "user":
                roles.add(new Role(2, "user", "普通用户角色"));
                break;
        }
    }

    public User(String username, String password, List<Role> roles) {
        this.username = username;
        this.password = password;
        this.roles = roles;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

     public List<Role> getRoles() {
        return roles;
    }

    public void setRoles(List<Role> roles) {
        this.roles = roles;
    }

    // 兼容旧代码的getRole方法
    public String getRole() {
        if (roles == null || roles.isEmpty()) {
            return "user";
        }
        return roles.get(0).getRoleName();
    }

     // 兼容旧代码的setRole方法
    public void setRole(String role) {
        this.roles = new ArrayList<>();
        switch (role) {
            case "admin":
                this.roles.add(new Role(1, "系统管理员", "拥有系统所有权限"));
                break;
            case "user":
                this.roles.add(new Role(9, "普通用户", "仅可查看基本信息"));
                break;
        }
    }
}

