package dao;

import model.User;
import model.Role;
import java.util.*;

/**
 * 用户数据访问层
 * 负责用户数据的增删改查操作
 */
public class UserDao {
    private Map<String, User> users;  // 用户名 -> 用户信息
    private Map<String, Role> roles;  // 角色名 -> 角色信息

    public UserDao() {
        this.users = new HashMap<>();
        this.roles = new HashMap<>();
        // 初始化默认角色
        initRoles();
        // 初始化默认用户
        initDefaultUsers();
    }
    

    private void initRoles() {
        roles.put("admin", new Role(1, "系统管理员", "拥有系统所有权限"));
        roles.put("repoAdmin", new Role(2, "仓库管理员", "负责仓库管理"));
        roles.put("stockOp", new Role(3, "库存操作员", "负责库存操作"));
        roles.put("buyer", new Role(4, "采购员", "负责采购管理"));
        roles.put("seller", new Role(5, "销售员", "负责销售管理"));
        roles.put("stockAnalyst", new Role(6, "库存分析师", "负责库存分析"));
        roles.put("qualityControl", new Role(7, "质量控制员", "负责质量控制"));
        roles.put("approver", new Role(8, "审核/审批人", "负责审核审批"));
        roles.put("user", new Role(9, "普通用户", "仅可查看基本信息"));
    }

    /**
     * 初始化默认用户
     */
    private void initDefaultUsers() {
        List<Role> adminRoles = new ArrayList<>();
        // 默认管理员账号：admin/admin123
        users.put("admin", new User("admin", "admin123", "admin"));
        // 可以添加更多默认用户
        users.put("user", new User("user", "user123", "user"));

        // 多角色用户：user/user123
        List<Role> userRoles = new ArrayList<>();
        userRoles.add(roles.get(3)); // 库存操作员
        userRoles.add(roles.get(5)); // 销售员
        users.put("user", new User("user", "user123", userRoles));

        // 仓库管理员：warehouse/warehouse123
        List<Role> warehouseRoles = new ArrayList<>();
        warehouseRoles.add(roles.get(2)); // 仓库管理员
        users.put("warehouse", new User("warehouse", "warehouse123", warehouseRoles));
    }

    /**
     * 根据用户名查找用户
     * @param username 用户名
     * @return 用户对象，如果不存在则返回null
     */
    public User findUserByUsername(String username) {
        return users.get(username);
    }

    /**
     * 添加用户
     * @param user 用户对象
     * @return 是否添加成功
     */
    public boolean addUser(User user) {
        if (users.containsKey(user.getUsername())) {
            return false;
        }
        users.put(user.getUsername(), user);
        return true;
    }

    /**
     * 获取所有用户
     * @return 所有用户的列表
     */
    public List<User> getAllUsers() {
        return new ArrayList<>(users.values());
    }

    /**
     * 获取所有角色
     * @return 所有角色的列表
     */
    public List<Role> getAllRoles() {
        return new ArrayList<>(roles.values());
    }

    /**
     * 根据角色ID获取角色
     * @param roleId 角色ID
     * @return 角色对象
     */
    public Role getRoleById(int roleId) {
        return roles.get(roleId);
    }
}

