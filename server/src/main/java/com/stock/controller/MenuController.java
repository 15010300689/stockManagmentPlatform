package com.stock.controller;

import com.stock.dto.Result;
import com.stock.dto.RolePermissionRequest;
import com.stock.dto.RoleMenuRequest;
import com.stock.entity.Menu;
import com.stock.entity.Permission;
import com.stock.entity.Role;
import com.stock.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api")
public class MenuController {

    @Autowired
    private MenuService menuService;

    /** 当前登录用户菜单树 */
    @GetMapping("/auth/menus")
    public Object getMyMenus(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("未登录或登录已过期");
        }
        return menuService.getUserMenuTree(userId);
    }

    /** 管理员查看全部菜单 */
    @GetMapping("/admin/menus")
    public List<Menu> getAllMenus() {
        return menuService.getAllMenus();
    }

    /** 管理员新增菜单 */
    @PostMapping("/admin/menu")
    public Result addMenu(@RequestBody Menu menu) {
        if (menuService.createMenu(menu)) {
            return Result.ok("菜单新增成功");
        }
        return Result.error("菜单新增失败");
    }

    /** 管理员修改菜单 */
    @PutMapping("/admin/menu/{id}")
    public Result updateMenu(@PathVariable Long id, @RequestBody Menu menu) {
        if (menuService.updateMenu(id, menu)) {
            return Result.ok("菜单更新成功");
        }
        return Result.error("菜单更新失败");
    }

    /** 角色列表 */
    @GetMapping("/admin/roles")
    public List<Role> getRoles() {
        return menuService.getRoles();
    }

    /** 角色分页列表 */
    @GetMapping("/roles")
    public Object getRolePage(@RequestParam(required = false) String roleName,
                              @RequestParam(defaultValue = "1") Integer pageNo,
                              @RequestParam(defaultValue = "10") Integer pageSize) {
        return menuService.getRolesByPage(roleName, pageNo, pageSize);
    }

    /** 某个角色已绑定的菜单ID */
    @GetMapping("/admin/role/{roleId}/menu-ids")
    public List<Long> getRoleMenuIds(@PathVariable Long roleId) {
        return menuService.getRoleMenuIds(roleId);
    }

    /** 保存角色菜单绑定 */
    @PostMapping("/admin/role/{roleId}/menus")
    public Result saveRoleMenus(@PathVariable Long roleId, @RequestBody RoleMenuRequest req) {
        menuService.saveRoleMenus(roleId, req.getMenuIds());
        return Result.ok("角色菜单配置成功");
    }

    /** 权限列表 */
    @GetMapping("/admin/permissions")
    public List<Permission> getPermissions() {
        return menuService.getAllPermissions();
    }

    /** 某个角色已绑定的权限ID */
    @GetMapping("/admin/role/{roleId}/permission-ids")
    public List<Long> getRolePermissionIds(@PathVariable Long roleId) {
        return menuService.getRolePermissionIds(roleId);
    }

    /** 保存角色权限绑定 */
    @PostMapping("/admin/role/{roleId}/permissions")
    public Result saveRolePermissions(@PathVariable Long roleId, @RequestBody RolePermissionRequest req) {
        menuService.saveRolePermissions(roleId, req.getPermissionIds());
        return Result.ok("角色权限配置成功");
    }
}
