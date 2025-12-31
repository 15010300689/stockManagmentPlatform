import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 认证管理类
 * 处理用户登录、token生成和验证
 */
public class AuthManager {
    private Map<String, User> users;  // 用户名 -> 用户信息
    private Map<String, String> tokens;  // token -> 用户名
    private Map<String, Long> tokenExpiry;  // token -> 过期时间
    private static final long TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24小时
    private static final String TOKEN_PREFIX = "token_";

    public AuthManager() {
        this.users = new HashMap<>();
        this.tokens = new ConcurrentHashMap<>();
        this.tokenExpiry = new ConcurrentHashMap<>();
        
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
     * 用户登录
     * @param username 用户名
     * @param password 密码
     * @return token，如果登录失败返回null
     */
    public String login(String username, String password) {
        User user = users.get(username);
        if (user != null && user.getPassword().equals(password)) {
            // 生成token
            String token = generateToken(username);
            tokens.put(token, username);
            tokenExpiry.put(token, System.currentTimeMillis() + TOKEN_EXPIRY_TIME);
            return token;
        }
        return null;
    }

    /**
     * 验证token是否有效
     * @param token token字符串
     * @return 如果token有效返回用户名，否则返回null
     */
    public String validateToken(String token) {
        if (token == null || !tokens.containsKey(token)) {
            return null;
        }
        
        // 检查token是否过期
        Long expiry = tokenExpiry.get(token);
        if (expiry == null || System.currentTimeMillis() > expiry) {
            // token已过期，清除
            tokens.remove(token);
            tokenExpiry.remove(token);
            return null;
        }
        
        return tokens.get(token);
    }

    /**
     * 用户登出
     * @param token token字符串
     */
    public void logout(String token) {
        tokens.remove(token);
        tokenExpiry.remove(token);
    }

    /**
     * 生成token
     */
    private String generateToken(String username) {
        return TOKEN_PREFIX + username + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * 添加用户（用于后续扩展）
     */
    public boolean addUser(String username, String password, String role) {
        if (users.containsKey(username)) {
            return false;
        }
        users.put(username, new User(username, password, role));
        return true;
    }
}

