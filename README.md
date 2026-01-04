# 库存管理系统

一个基于Java的Web库存管理系统，采用前后端分离架构，前端使用React + Ant Design UI框架，提供美观整洁的用户界面。

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
backend/
├── ApiServer.java          # HTTP服务器配置和路由
├── config/
│   └── Main.java           # 应用启动入口
├── controller/             # 表现层（Controller层）
│   ├── ProductController.java
│   └── AuthController.java
├── service/                # 业务逻辑层（Service层）
│   ├── ProductService.java
│   └── AuthService.java
├── dao/                    # 数据访问层（DAO层）
│   ├── ProductDao.java
│   └── UserDao.java
├── model/                  # 实体层
│   ├── Product.java
│   └── User.java
└── util/                   # 工具层
    └── JsonUtil.java
├── frontend/                   # 前端工程目录
│   ├── package.json                # 前端依赖配置
│   ├── vite.config.js              # Vite构建配置
│   ├── index.html                  # 前端入口HTML（开发用）
│   └── src/                        # 前端源代码目录
│       ├── main.jsx               # React应用入口
│       ├── App.jsx                # 主应用组件（路由配置）
│       ├── auth.js                # 认证工具函数
│       ├── index.css              # 全局样式
│       ├── components/            # 可复用组件
│       │   ├── StatisticsModal.jsx   # 统计信息模态框
│       │   └── LowStockModal.jsx     # 低库存预警模态框
│       ├── pages/                 # 页面组件
│       │   ├── Login.jsx             # 登录页面
│       │   ├── ProductManagement.jsx # 商品管理页面
│       │   ├── AccountManagement.jsx # 账号管理页面
│       │   ├── PermissionManagement.jsx # 权限管理页面
│       │   ├── RoleManagement.jsx    # 角色管理页面
│       │   └── UserManagement.jsx    # 用户管理页面
│       ├── layouts/               # 布局组件
│       │   └── MainLayout.jsx        # 主布局组件
│       └── routes/                # 路由配置
│           ├── index.jsx            # 路由配置入口
│           └── PrivateRoute.jsx     # 私有路由保护组件
└── README.md                    # 项目说明文档
```

## 编译和运行

### 后端运行

#### 1. 进入后端目录

```bash
cd backend
```

#### 2. 编译Java文件

```bash
javac *.java
```

#### 3. 运行服务器

```bash
java Main
```

服务器将在 `http://localhost:8080` 启动。

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

构建后的文件将输出到 `../backend/web` 目录。

4. 启动后端服务器

在项目根目录执行：

```bash
cd backend
javac *.java
java Main
```

5. 访问系统

在浏览器中打开：`http://localhost:8080`

### 预览生产构建

如果想预览构建后的结果，可以在前端目录运行：

```bash
cd frontend
npm run preview
# 或
yarn preview
```

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
- Java SE（使用内置HttpServer）
- RESTful API设计
- JSON数据交换
- Token认证机制

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

### InventoryManager 类
库存管理核心类，提供以下功能：
- 商品的增删改查
- 库存的入库和出库操作
- 商品统计和查询功能

### AuthManager 类
认证管理类，提供以下功能：
- 用户登录验证
- Token生成和管理
- Token验证和过期处理

### ApiServer 类
REST API服务器类，提供：
- HTTP服务器功能
- RESTful API路由
- 静态文件服务
- JSON响应处理
- CORS支持
- Token验证中间件

### JsonUtil 类
JSON工具类，提供：
- 对象到JSON字符串的序列化
- JSON字符串到对象的反序列化
- 简单的JSON解析功能

### Main 类
主程序类，负责：
- 初始化库存管理器
- 初始化认证管理器
- 加载示例数据
- 启动HTTP服务器

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
- 生产环境构建后，静态文件会输出到 `backend/web` 目录，由后端服务器提供
- 开发模式下，前端通过Vite代理访问后端API（`/api` -> `http://localhost:8080/api`）
- Token存储在浏览器的localStorage中，清除浏览器数据会导致需要重新登录
- 在生产环境中，建议修改默认账号密码，并实现密码加密存储

## 开发说明

### 自定义端口

要修改服务器端口，编辑 `backend/ApiServer.java` 中的 `PORT` 常量：

```java
private static final int PORT = 8080; // 修改为你想要的端口
```

### 添加新功能

#### 后端

1. 在 `InventoryManager` 或 `AuthManager` 中添加业务逻辑
2. 在 `ApiServer` 中添加新的API路由
3. 如需要认证，确保API处理函数中包含Token验证逻辑

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
