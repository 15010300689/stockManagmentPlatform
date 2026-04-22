package com.stock.service;

import com.stock.entity.Menu;
import com.stock.entity.Permission;
import com.stock.entity.Role;
import com.stock.mapper.MenuMapper;
import com.stock.mapper.PermissionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MenuService {

    @Autowired
    private MenuMapper menuMapper;
    @Autowired
    private PermissionMapper permissionMapper;

    public List<Map<String, Object>> getUserMenuTree(Long userId) {
        List<Menu> menus = menuMapper.findUserMenus(userId);
        return buildTree(menus);
    }

    public List<Menu> getAllMenus() {
        return menuMapper.findAllMenus();
    }

    public boolean createMenu(Menu menu) {
        if (menu.getName() == null || menu.getName().trim().isEmpty()) {
            return false;
        }
        if (menu.getVisible() == null) menu.setVisible(1);
        if (menu.getStatus() == null) menu.setStatus(1);
        if (menu.getSortNo() == null) menu.setSortNo(0);
        return menuMapper.insert(menu) > 0;
    }

    public boolean updateMenu(Long id, Menu menu) {
        Menu old = menuMapper.findById(id);
        if (old == null) return false;
        menu.setId(id);
        return menuMapper.update(menu) > 0;
    }

    public List<Role> getRoles() {
        return menuMapper.findAllRoles();
    }

    public Map<String, Object> getRolesByPage(String roleName, Integer pageNo, Integer pageSize) {
        int safePageNo = (pageNo == null || pageNo < 1) ? 1 : pageNo;
        int safePageSize = (pageSize == null || pageSize < 1) ? 10 : Math.min(pageSize, 100);
        String safeRoleName = roleName == null ? null : roleName.trim();
        int offset = (safePageNo - 1) * safePageSize;

        int total = menuMapper.countRolesByName(safeRoleName);
        List<Role> list = total <= 0
                ? Collections.emptyList()
                : menuMapper.findRolesByNamePage(safeRoleName, offset, safePageSize);

        Map<String, Object> result = new HashMap<>();
        result.put("data", list);
        result.put("total", total);
        result.put("pageNo", safePageNo);
        result.put("pageSize", safePageSize);
        return result;
    }

    public List<Long> getRoleMenuIds(Long roleId) {
        return menuMapper.findMenuIdsByRoleId(roleId);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean saveRoleMenus(Long roleId, List<Long> menuIds) {
        menuMapper.deleteRoleMenus(roleId);
        if (menuIds != null) {
            for (Long menuId : menuIds) {
                menuMapper.insertRoleMenu(roleId, menuId);
            }
        }
        return true;
    }

    public List<Permission> getAllPermissions() {
        return permissionMapper.findAllPermissions();
    }

    public List<Long> getRolePermissionIds(Long roleId) {
        return permissionMapper.findPermissionIdsByRoleId(roleId);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean saveRolePermissions(Long roleId, List<Long> permissionIds) {
        permissionMapper.deleteRolePermissions(roleId);
        if (permissionIds != null) {
            for (Long permissionId : permissionIds) {
                permissionMapper.insertRolePermission(roleId, permissionId);
            }
        }
        return true;
    }

    private List<Map<String, Object>> buildTree(List<Menu> menus) {
        List<Map<String, Object>> roots = new ArrayList<>();
        Map<Long, List<Menu>> childrenMap = new HashMap<>();

        for (Menu menu : menus) {
            Long parentId = menu.getParentId() == null ? 0L : menu.getParentId();
            childrenMap.computeIfAbsent(parentId, k -> new ArrayList<>()).add(menu);
        }

        List<Menu> rootMenus = childrenMap.getOrDefault(0L, new ArrayList<>());
        for (Menu root : rootMenus) {
            roots.add(toMenuItem(root, childrenMap));
        }
        return roots;
    }

    private Map<String, Object> toMenuItem(Menu menu, Map<Long, List<Menu>> childrenMap) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", menu.getId());
        item.put("key", menu.getPath());
        item.put("label", menu.getIcon() != null && !menu.getIcon().isEmpty()
                ? menu.getIcon() + " " + menu.getName()
                : menu.getName());
        item.put("name", menu.getName());
        item.put("path", menu.getPath());

        List<Menu> children = childrenMap.get(menu.getId());
        if (children != null && !children.isEmpty()) {
            List<Map<String, Object>> childItems = new ArrayList<>();
            for (Menu child : children) {
                childItems.add(toMenuItem(child, childrenMap));
            }
            item.put("children", childItems);
        }
        return item;
    }
}
