## 后端接入真实数据库（给前端同学的最简步骤）

本项目后端不使用 Spring，仅用 `HttpServer + JDBC`。

### 1) 你需要确认数据库类型

默认我按 **MySQL** 写了脚本与 JDBC 连接（`backend/sql/schema_mysql.sql`）。

### 2) MyEclipse 导入 JDBC 驱动 jar

以 MySQL 为例，需要 `mysql-connector-j`（JDBC 驱动）。

- 下载驱动 jar（例如 `mysql-connector-j-8.x.x.jar`）
- 在 MyEclipse：
  - 右键项目 → **Properties**
  - **Java Build Path** → **Libraries**
  - **Add External JARs...** → 选择驱动 jar
  - Apply & Close

> 没有 Maven/Gradle 时，必须手动加 jar，否则 JDBC 会连不上。

### 3) 创建数据库并执行建表脚本

1. 创建库（示例）

```sql
CREATE DATABASE stock DEFAULT CHARACTER SET utf8mb4;
```

2. 执行建表脚本：`backend/sql/schema_mysql.sql`

（你可以在数据库客户端执行，也可以用 MyEclipse 的数据库工具执行）

### 4) 配置环境变量（最简单的开关）

项目里通过环境变量控制是否启用 DB：

- `DB_ENABLED=true`
- `DB_URL=jdbc:mysql://localhost:3306/stock?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai`
- `DB_USER=root`
- `DB_PASS=你的密码`

在 MyEclipse 的 Run Configuration 里设置：

- Run → Run Configurations...
- 选择你的 Java Application（启动类是 `config.Main`）
- 找到 **Environment** → Add

不配置或 `DB_ENABLED` 不为 true 时，会自动走内存 mock 数据（不会影响你跑通页面）。

### 5) 启动验证

启动 `config.Main` 后，用 Postman/curl 测一下（注意你登录还没完全打通的话，需要先绕过或暂时关闭 token 校验）。

后端已提供接口：
- `GET /api/stores`
- `GET /api/positions?warehouseId=1`
- `GET /api/inventory/summary?productId=P001`
- `POST /api/inventory/adjust`

`/api/inventory/adjust` 示例 body：

```json
{
  "productId": "P001",
  "warehouseId": 1,
  "positionId": 4,
  "amount": 3,
  "type": "in",
  "remark": "补货"
}
```

### 6) 说明：代码是怎么切到数据库的？

DAO 中统一判断 `util.DbUtil.isEnabled()`：
- true：走 JDBC 查询/更新（真实库）
- false：走内存 Map（mock）

对应实现你可以看：
- `backend/util/DbUtil.java`
- `backend/dao/ProductDao.java`
- `backend/dao/WarehouseDao.java`
- `backend/dao/PositionDao.java`
- `backend/dao/InventoryDao.java`

