package com.stock.entity;

public class Permission {
    private Long id;
    private String permissionName;
    private String permissionCode;
    private String path;
    private String method;
    private String description;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPermissionName() { return permissionName; }
    public void setPermissionName(String permissionName) { this.permissionName = permissionName; }
    public String getPermissionCode() { return permissionCode; }
    public void setPermissionCode(String permissionCode) { this.permissionCode = permissionCode; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
