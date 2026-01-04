package dao;

import model.User;
import java.util.*;

/**
 * 用户数据访问层
 * 负责用户数据的增删改查操作
 */
public class UserDao {
    private Map<String, User> users;  // 用户名 -> 用户信息

    public UserDao() {
        this.users = new HashMap<>();
        // 初始化默认用户
        initDefaultUsers();
    }

    /**
     * 初始化默认用户
     */
    private void initDefaultUsers() {
        // 默认管理员账号：admin/admin123
        users.put("admin", new User("admin", "admin123", "admin"));
        // 可以添加更多默认用户
        users.put("user", new User("user", "user123", "user"));
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
}

