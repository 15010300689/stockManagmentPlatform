package dao;

import model.InventoryRecord;
import util.DbUtil;
import java.sql.*;
import java.util.*;

public class InventoryDao {
    // key: productId|warehouseId|positionId
    private final Map<String, InventoryRecord> inventory = new HashMap<>();

    private String key(String productId, Integer warehouseId, Integer positionId) {
        return productId + "|" + warehouseId + "|" + (positionId == null ? "null" : positionId);
    }

    public InventoryDao() {
        // 初始一些分仓库存示例
        addOrUpdate(new InventoryRecord("P001", 1, 4, 20));
        addOrUpdate(new InventoryRecord("P001", 1, 5, 15));
        addOrUpdate(new InventoryRecord("P001", 2, 14, 5));
        addOrUpdate(new InventoryRecord("P002", 1, 7, 12));
    }

    public List<InventoryRecord> listByProduct(String productId) {
        if (DbUtil.isEnabled()) {
            return listByProductFromDb(productId, null);
        }
        List<InventoryRecord> res = new ArrayList<>();
        for (InventoryRecord r : inventory.values()) {
            if (r.getProductId().equals(productId)) {
                res.add(r);
            }
        }
        return res;
    }

    public List<InventoryRecord> listByProductAndWarehouse(String productId, Integer warehouseId) {
        if (DbUtil.isEnabled()) {
            return listByProductFromDb(productId, warehouseId);
        }
        List<InventoryRecord> res = new ArrayList<>();
        for (InventoryRecord r : inventory.values()) {
            if (r.getProductId().equals(productId) && r.getWarehouseId().equals(warehouseId)) {
                res.add(r);
            }
        }
        return res;
    }

    public InventoryRecord getRecord(String productId, Integer warehouseId, Integer positionId) {
        if (DbUtil.isEnabled()) {
            return getRecordFromDb(productId, warehouseId, positionId);
        }
        return inventory.get(key(productId, warehouseId, positionId));
    }

    public void addOrUpdate(InventoryRecord record) {
        if (DbUtil.isEnabled()) {
            upsertToDb(record);
            return;
        }
        String k = key(record.getProductId(), record.getWarehouseId(), record.getPositionId());
        inventory.put(k, record);
    }

    public boolean adjust(String productId, Integer warehouseId, Integer positionId, int amount, String type) {
        if (DbUtil.isEnabled()) {
            return adjustFromDb(productId, warehouseId, positionId, amount, type);
        }
        String k = key(productId, warehouseId, positionId);
        InventoryRecord record = inventory.get(k);
        if (record == null) {
            if ("out".equals(type)) {
                return false; // 无记录无法出库
            }
            record = new InventoryRecord(productId, warehouseId, positionId, 0);
            inventory.put(k, record);
        }
        if ("in".equals(type)) {
            record.addQuantity(amount);
            return true;
        } else if ("out".equals(type)) {
            return record.reduceQuantity(amount);
        }
        return false;
    }

    private List<InventoryRecord> listByProductFromDb(String productId, Integer warehouseId) {
        List<InventoryRecord> res = new ArrayList<>();
        String sql = "SELECT product_id, warehouse_id, position_id, quantity FROM inventory WHERE product_id = ?"
                + (warehouseId == null ? "" : " AND warehouse_id = ?");
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, productId);
            if (warehouseId != null) {
                ps.setInt(2, warehouseId);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Integer posId = (Integer) rs.getObject("position_id");
                    res.add(new InventoryRecord(
                            rs.getString("product_id"),
                            rs.getInt("warehouse_id"),
                            posId,
                            rs.getInt("quantity")
                    ));
                }
            }
        } catch (SQLException e) {
            // 兜底内存
            return warehouseId == null ? listByProduct(productId) : listByProductAndWarehouse(productId, warehouseId);
        }
        return res;
    }

    private InventoryRecord getRecordFromDb(String productId, Integer warehouseId, Integer positionId) {
        String sql = "SELECT product_id, warehouse_id, position_id, quantity FROM inventory WHERE product_id=? AND warehouse_id=? AND "
                + (positionId == null ? "position_id IS NULL" : "position_id=?");
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, productId);
            ps.setInt(2, warehouseId);
            if (positionId != null) {
                ps.setInt(3, positionId);
            }
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Integer posId = (Integer) rs.getObject("position_id");
                    return new InventoryRecord(
                            rs.getString("product_id"),
                            rs.getInt("warehouse_id"),
                            posId,
                            rs.getInt("quantity")
                    );
                }
            }
        } catch (SQLException e) {
            return inventory.get(key(productId, warehouseId, positionId));
        }
        return null;
    }

    private void upsertToDb(InventoryRecord record) {
        // MySQL 8: ON DUPLICATE KEY UPDATE
        String sql = "INSERT INTO inventory (product_id, warehouse_id, position_id, quantity) VALUES (?, ?, ?, ?) "
                + "ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)";
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, record.getProductId());
            ps.setInt(2, record.getWarehouseId());
            if (record.getPositionId() == null) ps.setNull(3, Types.INTEGER); else ps.setInt(3, record.getPositionId());
            ps.setInt(4, record.getQuantity());
            ps.executeUpdate();
        } catch (SQLException ignored) {
            // ignore
        }
    }

    private boolean adjustFromDb(String productId, Integer warehouseId, Integer positionId, int amount, String type) {
        // 简化实现：先查当前记录，再更新（并发场景后续可加事务/锁）
        InventoryRecord record = getRecordFromDb(productId, warehouseId, positionId);
        int current = record == null ? 0 : record.getQuantity();
        int next = current;
        if ("in".equals(type)) {
            next = current + amount;
        } else if ("out".equals(type)) {
            if (current < amount) return false;
            next = current - amount;
        } else {
            return false;
        }

        String sql;
        if (record == null) {
            sql = "INSERT INTO inventory (product_id, warehouse_id, position_id, quantity) VALUES (?, ?, ?, ?)";
        } else {
            sql = "UPDATE inventory SET quantity=? WHERE product_id=? AND warehouse_id=? AND "
                    + (positionId == null ? "position_id IS NULL" : "position_id=?");
        }

        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            int idx = 1;
            if (record == null) {
                ps.setString(idx++, productId);
                ps.setInt(idx++, warehouseId);
                if (positionId == null) ps.setNull(idx++, Types.INTEGER); else ps.setInt(idx++, positionId);
                ps.setInt(idx++, next);
            } else {
                ps.setInt(idx++, next);
                ps.setString(idx++, productId);
                ps.setInt(idx++, warehouseId);
                if (positionId != null) {
                    ps.setInt(idx++, positionId);
                }
            }
            ps.executeUpdate();
            return true;
        } catch (SQLException e) {
            return adjust(productId, warehouseId, positionId, amount, type);
        }
    }
}
