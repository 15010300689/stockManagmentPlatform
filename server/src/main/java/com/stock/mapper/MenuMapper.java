package com.stock.mapper;

import com.stock.entity.Menu;
import com.stock.entity.Role;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface MenuMapper {

    List<Menu> findUserMenus(@Param("userId") Long userId);

    List<Menu> findAllMenus();

    int insert(Menu menu);

    int update(Menu menu);

    Menu findById(@Param("id") Long id);

    List<Role> findAllRoles();

    List<Long> findMenuIdsByRoleId(@Param("roleId") Long roleId);

    int deleteRoleMenus(@Param("roleId") Long roleId);

    int insertRoleMenu(@Param("roleId") Long roleId, @Param("menuId") Long menuId);
}
