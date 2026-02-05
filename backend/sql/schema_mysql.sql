-- MySQL 建表脚本（最小可用）
-- 数据库：stock（你也可以换成别的库名，DB_URL 对应修改即可）

CREATE TABLE IF NOT EXISTS product (
  id        VARCHAR(64) PRIMARY KEY,
  name      VARCHAR(255) NOT NULL,
  price     DECIMAL(18,2) NOT NULL DEFAULT 0,
  quantity  INT NOT NULL DEFAULT 0,
  category  VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS warehouse (
  id      INT PRIMARY KEY AUTO_INCREMENT,
  code    VARCHAR(64) NOT NULL UNIQUE,
  name    VARCHAR(255) NOT NULL,
  status  CHAR(1) NOT NULL DEFAULT '1',
  address VARCHAR(255),
  contact VARCHAR(64),
  phone   VARCHAR(64)
);

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

-- 真实库存：维度为 商品 + 仓库 + 仓位(可空)
CREATE TABLE IF NOT EXISTS inventory (
  product_id   VARCHAR(64) NOT NULL,
  warehouse_id INT NOT NULL,
  position_id  INT NULL,
  quantity     INT NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, warehouse_id, position_id),
  CONSTRAINT fk_inv_product FOREIGN KEY (product_id) REFERENCES product(id),
  CONSTRAINT fk_inv_wh FOREIGN KEY (warehouse_id) REFERENCES warehouse(id)
);

-- 可选：库存流水（后续你要做“库存流水”页会用到）
CREATE TABLE IF NOT EXISTS inventory_log (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id   VARCHAR(64) NOT NULL,
  warehouse_id INT NOT NULL,
  position_id  INT NULL,
  type         VARCHAR(16) NOT NULL,  -- in/out
  amount       INT NOT NULL,
  remark       VARCHAR(255),
  create_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_log_product (product_id),
  INDEX idx_log_wh (warehouse_id)
);

