-- ========================================
-- 库存管理系统 MySQL 建表脚本
-- 数据库名: stock
-- ========================================

CREATE DATABASE IF NOT EXISTS stock DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE stock;

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  username    VARCHAR(50) NOT NULL UNIQUE,
  password    VARCHAR(100) NOT NULL,
  real_name   VARCHAR(50),
  phone       VARCHAR(20),
  email       VARCHAR(100),
  status      TINYINT NOT NULL DEFAULT 1 COMMENT '1启用 0禁用',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  role_name   VARCHAR(50) NOT NULL,
  role_code   VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  status      TINYINT NOT NULL DEFAULT 1,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 权限表
CREATE TABLE IF NOT EXISTS sys_permission (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  permission_name VARCHAR(50) NOT NULL,
  permission_code VARCHAR(100) NOT NULL UNIQUE,
  path            VARCHAR(255),
  method          VARCHAR(20),
  description     VARCHAR(255)
);

-- 用户角色关系表
CREATE TABLE IF NOT EXISTS sys_user_role (
  id      BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  INDEX idx_ur_user (user_id),
  INDEX idx_ur_role (role_id)
);

-- 角色权限关系表
CREATE TABLE IF NOT EXISTS sys_role_permission (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  role_id       BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  UNIQUE KEY uk_role_permission (role_id, permission_id),
  INDEX idx_rp_role (role_id),
  INDEX idx_rp_perm (permission_id)
);

-- 菜单表（动态菜单）
CREATE TABLE IF NOT EXISTS sys_menu (
  id        BIGINT PRIMARY KEY AUTO_INCREMENT,
  parent_id BIGINT DEFAULT 0 COMMENT '父菜单ID，0表示根节点',
  name      VARCHAR(100) NOT NULL COMMENT '菜单名称',
  path      VARCHAR(255) NOT NULL COMMENT '前端路由路径',
  icon      VARCHAR(50) DEFAULT NULL COMMENT '菜单图标(可存emoji或icon key)',
  sort_no   INT NOT NULL DEFAULT 0 COMMENT '排序',
  visible   TINYINT NOT NULL DEFAULT 1 COMMENT '是否可见：1可见 0隐藏',
  status    TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1启用 0停用'
);

-- 角色菜单关系表
CREATE TABLE IF NOT EXISTS sys_role_menu (
  id      BIGINT PRIMARY KEY AUTO_INCREMENT,
  role_id BIGINT NOT NULL,
  menu_id BIGINT NOT NULL,
  UNIQUE KEY uk_role_menu (role_id, menu_id),
  INDEX idx_rm_role (role_id),
  INDEX idx_rm_menu (menu_id)
);

-- 商品表（id 数据库自增；名称全局唯一）
CREATE TABLE IF NOT EXISTS product (
  id        BIGINT PRIMARY KEY AUTO_INCREMENT,
  name      VARCHAR(255) NOT NULL,
  price     DECIMAL(18,2) NOT NULL DEFAULT 0,
  quantity  INT NOT NULL DEFAULT 0,
  category  VARCHAR(255) DEFAULT NULL,
  safe_stock INT DEFAULT NULL,
  status    TINYINT DEFAULT 1,
  UNIQUE KEY uk_product_name (name)
);

-- 仓库表
CREATE TABLE IF NOT EXISTS warehouse (
  id      INT PRIMARY KEY AUTO_INCREMENT,
  code    VARCHAR(64) NOT NULL UNIQUE,
  name    VARCHAR(255) NOT NULL,
  status  CHAR(1) NOT NULL DEFAULT '1',
  address VARCHAR(255),
  contact VARCHAR(64),
  phone   VARCHAR(64),
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 仓位表
CREATE TABLE IF NOT EXISTS position (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  warehouse_id INT NOT NULL,
  parent_id    INT NULL,
  code         VARCHAR(64) NOT NULL,
  name         VARCHAR(255),
  type         VARCHAR(32) NOT NULL,
  status       CHAR(1) NOT NULL DEFAULT '1',
  max_capacity INT NOT NULL DEFAULT 0,
  unit         VARCHAR(32),
  INDEX idx_position_wh (warehouse_id),
  INDEX idx_position_parent (parent_id),
  CONSTRAINT fk_position_wh FOREIGN KEY (warehouse_id) REFERENCES warehouse(id)
);

-- 库存表
CREATE TABLE IF NOT EXISTS inventory (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id   BIGINT NOT NULL,
  warehouse_id INT NOT NULL,
  position_id  INT NULL,
  quantity     INT NOT NULL DEFAULT 0,
  update_time  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_inv_product_wh_pos (product_id, warehouse_id, position_id),
  CONSTRAINT fk_inv_product FOREIGN KEY (product_id) REFERENCES product(id),
  CONSTRAINT fk_inv_wh FOREIGN KEY (warehouse_id) REFERENCES warehouse(id)
);

-- 库存流水表
CREATE TABLE IF NOT EXISTS inventory_log (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id   BIGINT NOT NULL,
  warehouse_id INT NOT NULL,
  position_id  INT NULL,
  type         VARCHAR(16) NOT NULL COMMENT 'in/out',
  amount       INT NOT NULL,
  remark       VARCHAR(255),
  operator_id  BIGINT,
  create_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_log_product (product_id),
  INDEX idx_log_wh (warehouse_id)
);
