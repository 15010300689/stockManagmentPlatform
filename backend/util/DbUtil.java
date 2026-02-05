package util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * JDBC 工具类（无框架版本）
 *
 * 通过环境变量控制是否启用数据库：
 * - DB_ENABLED=true
 * - DB_URL=jdbc:mysql://localhost:3306/stock?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
 * - DB_USER=root
 * - DB_PASS=xxx
 *
 * 未启用 DB 时，DAO 继续使用内存 mock 数据。
 */
public class DbUtil {
    private static final String ENV_ENABLED = "DB_ENABLED";
    private static final String ENV_URL = "DB_URL";
    private static final String ENV_USER = "DB_USER";
    private static final String ENV_PASS = "DB_PASS";

    private static volatile boolean driverLoaded = false;

    public static boolean isEnabled() {
        String enabled = System.getenv(ENV_ENABLED);
        return enabled != null && ("true".equalsIgnoreCase(enabled) || "1".equals(enabled));
    }

    public static Connection getConnection() throws SQLException {
        String url = System.getenv(ENV_URL);
        String user = System.getenv(ENV_USER);
        String pass = System.getenv(ENV_PASS);

        if (url == null || url.trim().isEmpty()) {
            throw new SQLException("DB_URL 未配置");
        }

        // 尝试加载 MySQL 驱动（用户需在 MyEclipse 加入 mysql-connector-j jar）
        if (!driverLoaded) {
            synchronized (DbUtil.class) {
                if (!driverLoaded) {
                    try {
                        Class.forName("com.mysql.cj.jdbc.Driver");
                    } catch (Throwable ignored) {
                        // 允许用户使用其他驱动（例如 MariaDB/PG），只要 DB_URL 与 jar 匹配即可
                    }
                    driverLoaded = true;
                }
            }
        }

        return DriverManager.getConnection(url, user, pass);
    }
}

