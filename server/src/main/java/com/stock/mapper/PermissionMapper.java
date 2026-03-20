package com.stock.mapper;

import com.stock.entity.Permission;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface PermissionMapper {

    List<String> findUserPermissionCodes(@Param("userId") Long userId);

    String findPermissionCodeByApi(@Param("method") String method, @Param("path") String path);

    List<Permission> findAllPermissions();

    List<Long> findPermissionIdsByRoleId(@Param("roleId") Long roleId);

    int deleteRolePermissions(@Param("roleId") Long roleId);

    int insertRolePermission(@Param("roleId") Long roleId, @Param("permissionId") Long permissionId);
}
