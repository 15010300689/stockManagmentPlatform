# 库存管理系统

一个基于 Spring Boot + MySQL 的库存管理系统，采用前后端分离架构，前端使用 React + Ant Design UI 框架，提供美观整洁的用户界面。

> 当前唯一后端目录为 `server/`。

## 功能特性

- ✅ **用户认证**：登录验证，Token机制，路由保护
- ✅ **商品管理**：添加、删除、修改商品信息
- ✅ **商品查询**：支持按ID、名称（模糊搜索）、类别查询
- ✅ **库存操作**：商品入库、出库
- ✅ **库存统计**：查看商品总数、库存总价值、类别统计
- ✅ **低库存预警**：查看库存不足的商品
- ✅ **账号管理**：账号管理功能模块（开发中）
- ✅ **权限管理**：权限管理功能模块（开发中）
- ✅ **角色管理**：角色管理功能模块（开发中）
- ✅ **用户管理**：用户管理功能模块（开发中）
- ✅ **现代化UI**：使用Ant Design设计，界面美观整洁
- ✅ **响应式设计**：支持多种屏幕尺寸
- ✅ **路由管理**：使用React Router进行页面路由管理
- ✅ **模块化架构**：前端代码按模块拆分，结构清晰

## 系统要求

- Java JDK 8 或更高版本
- Node.js 14+ 和 npm/yarn（用于前端开发）
- 现代浏览器（Chrome、Firefox、Edge、Safari等）

## 项目结构

```
stockManagementPlatform/
├── server/                         # Spring Boot 后端（唯一运行后端）
│   ├── pom.xml
│   ├── src/main/java/com/stock/
│   │   ├── controller/             # 控制层
│   │   ├── service/                # 业务层
│   │   ├── mapper/                 # MyBatis Mapper
│   │   ├── entity/                 # 实体层
│   │   ├── dto/                    # DTO
│   │   ├── config/                 # 配置（JWT、拦截器、异常处理）
│   │   └── util/                   # 工具类
│   └── src/main/resources/
│       ├── mapper/                 # MyBatis XML
│       ├── sql/                    # schema.sql / data.sql
│       └── static/                 # 前端构建产物目录
├── frontend/                       # 前端工程目录
│       ├── package.json
│       ├── vite.config.js
│       └── src/
```

## 编译和运行

### 启动步骤
```
# 1. 先在 MySQL 中执行建表和初始化数据

mysql -u root -p < server/src/main/resources/sql/schema.sql
mysql -u root -p < server/src/main/resources/sql/data.sql


# 2. 修改 application.yml 中的数据库密码

# 3. 启动后端
cd server
mvn spring-boot:run
```



### 前端运行

#### 方式一：开发模式（推荐）

1. 进入前端目录

```bash
cd frontend
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

3. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

开发服务器将在 `http://localhost:3000` 启动，支持热重载。

#### 方式二：生产构建

1. 进入前端目录

```bash
cd frontend
```

2. 安装依赖（如果还没有安装）

```bash
npm install
```

3. 构建生产版本

```bash
npm run build
# 或
yarn build
```

构建后的文件将输出到 `../server/src/main/resources/static` 目录。

## 默认账号

系统提供了以下默认账号用于测试：

- **管理员账号**：`admin` / `admin123`
- **普通用户**：`user` / `user123`

> 注意：在生产环境中，请修改默认账号和密码！

## API接口说明

### 认证接口

- `POST /api/login` - 用户登录
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
  返回：
  ```json
  {
    "success": true,
    "token": "JWT_TOKEN",
    "username": "用户名"
  }
  ```

- `POST /api/logout` - 用户登出（需要Token）
- `GET /api/verify` - 验证Token有效性（需要Token）

### 商品管理

- `GET /api/products` - 获取所有商品列表（需要Token）
- `GET /api/products?name=关键词` - 按名称搜索商品（需要Token）
- `GET /api/products?category=类别` - 按类别查询商品（需要Token）
- `GET /api/product?id=商品ID` - 获取单个商品信息（需要Token）
- `POST /api/products` - 添加新商品（需要Token）
- `PUT /api/product?id=商品ID` - 更新商品信息（需要Token）
- `DELETE /api/product?id=商品ID` - 删除商品（需要Token）

### 库存操作

- `POST /api/stock-in` - 商品入库（需要Token）
  ```json
  {
    "id": "商品ID",
    "amount": 数量
  }
  ```
- `POST /api/stock-out` - 商品出库（需要Token）
  ```json
  {
    "id": "商品ID",
    "amount": 数量
  }
  ```

### 统计信息

- `GET /api/statistics` - 获取库存统计信息（需要Token）
- `GET /api/low-stock?threshold=阈值` - 查询低库存商品（需要Token）

> 注意：除了 `/api/login` 接口外，其他所有接口都需要在请求头中携带Token：`Authorization: Bearer <token>`

## 使用说明

### 登录系统

1. 访问系统首页，会自动跳转到登录页面
2. 输入用户名和密码（默认：admin/admin123）
3. 登录成功后自动跳转到商品管理页面

### 主界面功能

1. **左侧菜单导航**：点击菜单项切换不同功能模块
2. **添加商品**：在商品管理页面点击"➕ 添加商品"按钮，填写商品信息
3. **编辑商品**：在商品列表的操作列点击"编辑"按钮
4. **删除商品**：在商品列表的操作列点击"删除"按钮（需要确认）
5. **商品入库**：点击"入库"按钮，输入入库数量
6. **商品出库**：点击"出库"按钮，输入出库数量
7. **搜索商品**：在搜索框输入商品名称进行模糊搜索
8. **查看统计**：点击"📊 统计信息"查看库存统计
9. **低库存预警**：点击"⚠️ 低库存预警"查看库存不足的商品
10. **退出登录**：点击右上角的"退出"按钮

### 示例数据

系统启动时会自动加载一些示例数据：
- P001: 笔记本电脑（电子产品）
- P002: 无线鼠标（电子产品）
- P003: 办公椅（家具）
- P004: A4打印纸（办公用品）

## 技术栈

### 后端
- Spring Boot
- MyBatis
- MySQL
- RESTful API 设计
- JWT 认证机制

### 前端
- React 17
- React Router 5（路由管理）
- Ant Design 4.x（UI组件库）
- Vite（构建工具，快速且现代化）
- Moment.js（Ant Design 4.x依赖）
- 模块化组件架构
- 支持开发模式热重载
- 支持生产环境打包

## 类说明

### Product 类
商品实体类，包含以下属性：
- `id`: 商品ID（唯一标识）
- `name`: 商品名称
- `price`: 商品价格
- `quantity`: 库存数量
- `category`: 商品类别

### User 类
用户实体类，包含以下属性：
- `username`: 用户名
- `password`: 密码（实际应用中应加密存储）

### ProductService 类
商品业务服务类，提供以下功能：
- 商品增删改查
- 商品入库与出库
- 库存统计与低库存查询

### AuthService 类
认证业务服务类，提供以下功能：
- 用户登录验证
- JWT Token 生成和校验
- 用户角色信息加载

### InventoryService 类
库存业务服务类，提供以下功能：
- 仓库和仓位查询
- 分仓库存汇总
- 库存调整与流水记录

### Controller 层
后端控制层包括：
- `AuthController`：登录/登出/Token验证
- `ProductController`：商品管理与统计接口
- `InventoryController`：仓库、仓位与库存接口
- `MenuController`：动态菜单与角色菜单授权接口

### StockApplication 类
Spring Boot 启动类，负责：
- 应用初始化与自动装配
- Mapper 扫描
- Web 服务启动

## 前端架构说明

### 组件结构

- **pages/**：页面级组件，每个文件对应一个功能页面
- **components/**：可复用的通用组件
- **layouts/**：布局组件，定义页面的整体结构
- **routes/**：路由配置和路由保护逻辑
- **auth.js**：认证相关的工具函数

### 路由配置

- `/login` - 登录页面（公开）
- `/` - 商品管理页面（受保护）
- `/product` - 商品管理页面（受保护）
- `/account` - 账号管理页面（受保护）
- `/permission` - 权限管理页面（受保护）
- `/role` - 角色管理页面（受保护）
- `/user` - 用户管理页面（受保护）

所有业务页面都使用 `PrivateRoute` 组件进行保护，未登录用户访问会自动跳转到登录页面。

### 认证机制

- 登录成功后，Token存储在 localStorage 中
- 所有API请求通过 `authFetch` 函数自动携带Token
- Token有效期为24小时
- Token过期或无效时，自动清除认证信息并跳转到登录页

## 注意事项

- 商品ID必须唯一
- 出库数量不能超过当前库存
- 价格和数量必须为非负数
- 服务器默认运行在8080端口
- 前端开发服务器默认运行在3000端口
- 生产环境构建后，静态文件会输出到 `server/src/main/resources/static` 目录，由 Spring Boot 提供
- 开发模式下，前端通过Vite代理访问后端API（`/api` -> `http://localhost:8080/api`）
- Token存储在浏览器的localStorage中，清除浏览器数据会导致需要重新登录
- 在生产环境中，建议修改默认账号密码，并实现密码加密存储

## 开发说明

### 自定义端口

要修改服务器端口，编辑 `server/src/main/resources/application.yml` 中的 `server.port`：

```yaml
server:
  port: 8080
```

### 添加新功能

#### 后端

1. 在 `server/src/main/java/com/stock/service/` 中补充业务逻辑
2. 在 `server/src/main/java/com/stock/controller/` 中新增或扩展 API
3. 如需持久化，新增 Mapper 接口和 `resources/mapper` 对应 XML
4. 如需鉴权，结合 JWT 拦截器与角色权限配置处理

#### 前端

1. 在 `pages/` 目录中创建新的页面组件
2. 在 `routes/index.jsx` 中添加路由配置
3. 如需要菜单项，在 `layouts/MainLayout.jsx` 中添加菜单项
4. 如需API调用，使用 `authFetch` 函数确保携带Token

### 代码规范

- 前端组件使用函数式组件和React Hooks
- 遵循模块化设计原则，每个功能独立成文件
- 组件、页面、布局等按目录分类组织
- 使用ES6+语法和async/await处理异步操作

## 未来扩展建议

- ✅ 用户认证和权限管理（已完成基础功能）
- 🔄 完善账号、权限、角色、用户管理功能
- 数据持久化（保存到文件或数据库）
- 商品导入导出功能（Excel/CSV）
- 更丰富的统计报表和图表
- 操作日志记录
- 商品图片上传功能
- 批量操作功能
- 库存预警邮件/短信通知
- Token刷新机制
- 密码加密存储
- 多级权限控制
- API接口权限控制
