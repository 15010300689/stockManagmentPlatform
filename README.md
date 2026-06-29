# 库存管理系统

本项目是一个基于 Spring Boot、MyBatis、MySQL、React 和 Ant Design 的库存管理系统，采用前后端分离架构。系统围绕中小型企业仓储业务，提供商品管理、仓库仓位管理、库存出入库、库存流水追溯、低库存预警和角色权限控制等功能。

> 当前唯一后端目录为 `server/`，前端目录为 `frontend/`。

## 功能特性

- **用户认证**：支持登录、退出、JWT Token 校验和受保护路由。
- **角色权限控制**：支持用户、角色、菜单和接口权限配置，不同角色可访问不同菜单与接口。
- **商品管理**：支持商品新增、编辑、查询、删除校验和安全库存设置。
- **仓库管理**：支持仓库新增、编辑、删除、分页查询和状态管理。
- **仓位管理**：支持仓库下多级仓位维护，体现“仓库 1 对多仓位”的结构。
- **库存出入库**：支持按仓库、仓位进行入库和出库，出库时校验库存是否充足。
- **仓位容量控制**：入库到具体仓位时校验最大容量，避免超过仓位容量上限。
- **库存流水追溯**：记录入库、出库和库存调整操作，支持按商品、仓库、仓位查询流水。
- **库存统计**：统计商品总数、库存总价值和商品类别。
- **低库存预警**：根据商品安全库存或全局阈值筛选库存不足商品。
- **演示稳定性**：默认展示真实后端数据；本地 mock 只在显式开启时使用。

## 技术栈

### 后端

- Spring Boot 2.7.18
- MyBatis
- MySQL
- JWT
- Maven

### 前端

- React 18
- React Router 6
- Ant Design 6
- TypeScript
- Vite 5

## 项目结构

```text
stockManagmentPlatform/
├── server/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/stock/
│       │   ├── config/          # JWT 拦截器、跨域和全局异常处理
│       │   ├── controller/      # 接口控制层
│       │   ├── dto/             # 请求与响应对象
│       │   ├── entity/          # 实体类
│       │   ├── mapper/          # MyBatis Mapper 接口
│       │   ├── service/         # 业务逻辑
│       │   └── util/            # 工具类
│       └── resources/
│           ├── mapper/          # MyBatis XML
│           ├── sql/             # schema.sql / data.sql
│           └── static/          # 前端构建产物
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── routes/
│       ├── layouts/
│       ├── api/
│       └── mock/
└── README.md
```

## 数据库初始化

首次建库时执行：

```bash
mysql -u root -p < server/src/main/resources/sql/schema.sql
mysql -u root -p < server/src/main/resources/sql/data.sql
```

如果已有数据库，只需要执行升级和初始化脚本：

```bash
mysql -u root -p < server/src/main/resources/sql/data.sql
```

`data.sql` 会补充菜单权限字段、库存流水菜单、仓位唯一约束和库存唯一约束。库存唯一约束用于保证同一商品在同一仓库、同一仓位下只存在一条库存记录。

## 启动方式

### 1. 启动后端

先修改 `server/src/main/resources/application.yml` 中的数据库用户名和密码，然后执行：

```bash
cd server
mvn spring-boot:run
```

后端默认端口为 `8080`。

### 2. 启动前端开发服务

```bash
cd frontend
npm install
npm run dev
```

前端开发服务默认运行在 `http://localhost:3000`，开发环境通过 Vite 代理访问后端接口。

### 3. 构建生产版本

```bash
cd frontend
npm run build
```

构建产物会输出到：

```text
server/src/main/resources/static
```

随后可直接由 Spring Boot 提供前端页面。

## 默认账号

| 角色 | 用户名 | 密码 | 说明 |
| --- | --- | --- | --- |
| 系统管理员 | `admin` | `admin123` | 拥有用户、角色、菜单、商品、仓库、仓位和库存相关权限 |
| 仓库管理员 | `warehouse` | `warehouse123` | 主要用于仓库、仓位和库存操作 |
| 普通用户 | `user` | `user123` | 主要用于查询和查看统计信息 |

## 核心页面

- `/login`：登录页面
- `/welcome`：欢迎页
- `/product`：商品管理
- `/storeManagement`：仓库管理
- `/positionManagement`：仓位管理
- `/inventoryLogs`：库存流水
- `/role`：角色管理
- `/user`：用户管理
- `/permission/menu`：菜单配置
- `/unitManagement`：计量单位管理
- `/currencyManagement`：货币管理
- `/transportManagement`：运输途径管理

所有业务页面均通过 `PrivateRoute` 进行登录校验，动态菜单由后端根据角色权限返回。

## 核心接口

除 `/api/login` 外，其他接口都需要携带请求头：

```text
Authorization: Bearer <token>
```

### 认证与权限

- `POST /api/login`：用户登录
- `POST /api/logout`：退出登录
- `GET /api/auth/menus`：获取当前用户可访问菜单
- `GET /api/auth/permissions`：获取当前用户权限码
- `GET /api/admin/menus`：菜单配置
- `GET /api/admin/roles`：角色列表
- `GET /api/admin/permissions`：权限点列表

### 商品管理

- `GET /api/products?pageNo=1&pageSize=10`：分页查询商品
- `GET /api/products?name=关键词`：按名称模糊查询商品
- `GET /api/product?id=商品ID`：查询商品详情
- `POST /api/products`：新增商品
- `PUT /api/product?id=商品ID`：编辑商品
- `DELETE /api/product?id=商品ID`：删除商品

删除商品时，如果商品仍有库存或库存流水，系统会阻止物理删除，以保证库存流水可追溯。

### 仓库与仓位

- `GET /api/stores`：查询仓库
- `POST /api/stores`：新增仓库
- `PUT /api/stores/{id}`：编辑仓库
- `DELETE /api/stores/{id}`：删除仓库
- `GET /api/positions?warehouseId=1`：查询指定仓库下的仓位
- `POST /api/positions`：新增仓位
- `PUT /api/positions/{id}`：编辑仓位
- `DELETE /api/positions/{id}`：删除仓位

仓位管理会校验：

- 所属仓库必须存在
- 同一仓库下仓位编码不能重复
- 父级仓位必须属于同一仓库
- 编辑仓位时不能把上级设置为自己或自己的下级

### 库存操作

- `POST /api/stock-in`：商品入库
- `POST /api/stock-out`：商品出库
- `POST /api/inventory/adjust`：库存调整
- `GET /api/inventory/summary?productId=1`：商品分仓库存汇总
- `GET /api/inventory/positions?productId=1`：商品分仓位库存明细
- `GET /api/stores/{warehouseId}/inventory`：按仓库查询库存
- `GET /api/positions/{positionId}/inventory`：按仓位查询库存
- `GET /api/stores/{warehouseId}/position-occupancy`：查询仓位容量占用摘要
- `GET /api/inventory/logs`：查询库存流水

入库到具体仓位时，如果该仓位设置了最大容量，系统会校验入库后的总占用量是否超过容量上限。出库时系统会校验指定仓库或仓位的库存是否充足，避免出现负库存。

### 统计与预警

- `GET /api/statistics`：库存统计信息
- `GET /api/low-stock?threshold=10`：低库存预警

低库存预警规则：

- 商品设置了 `safe_stock` 时，按 `quantity < safe_stock` 判断
- 商品未设置 `safe_stock` 时，按接口传入的全局阈值判断

## 业务亮点

本系统的主要亮点包括：

1. **位置化库存管理**：库存不只记录商品总数量，还能细化到仓库和仓位。
2. **仓位容量占用展示**：仓位页面显示已占用数量、最大容量、剩余容量和占用率。
3. **库存一致性校验**：出库时校验库存是否充足，入库时校验仓位容量是否超限。
4. **库存流水可追溯**：每次入库、出库和库存调整都会记录流水，便于后续核查。
5. **角色权限控制**：通过角色、菜单和接口权限限制不同用户的访问范围。

## Mock 模式说明

项目保留了本地 mock 能力用于开发调试，但默认不会在后端异常时自动切换到 mock 数据。这样可以避免演示时页面显示假数据而数据库没有变化。

如需强制使用 mock，可设置：

```bash
VITE_FORCE_MOCK=true
```

或在浏览器 localStorage 中设置：

```text
inventory_force_mock=1
```

## 注意事项

- 商品名称全局唯一。
- 同一仓库下仓位编码唯一。
- 同一商品在同一仓库、同一仓位下只允许存在一条库存记录。
- 删除仓库或仓位时，如果已被库存数据引用，系统会阻止删除。
- 删除商品时，如果存在库存或库存流水，系统会阻止物理删除。
- 默认账号密码仅用于测试，正式使用时应修改密码并使用加密存储。
- 如果已有数据库，请执行 `data.sql` 以同步新增菜单和约束。

## 验证命令

```bash
cd frontend
npm run type-check
npm run build

cd ../server
mvn -DskipTests compile
```

当前项目已通过上述检查。

## 后续扩展建议

- 商品导入导出
- 批量库存调整
- 库存调拨
- 操作人员写入库存流水
- 密码加密存储
- Token 刷新机制
- 更丰富的图表统计
- 邮件或短信库存预警
