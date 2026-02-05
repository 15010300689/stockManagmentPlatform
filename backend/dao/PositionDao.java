package dao;

import model.Position;
import util.DbUtil;
import java.sql.*;
import java.util.*;

public class PositionDao {
    private final Map<Integer, Position> positions = new HashMap<>();

    public PositionDao() {
        // mock from frontend
        add(new Position(1, 1, null, "A区", "A区", "area", "1", 1000, "007"));
        add(new Position(2, 1, 1, "A-01", "A区01号货架", "shelf", "1", 100, "007"));
        add(new Position(3, 1, 2, "A-01-1", "A区01号货架第1层", "level", "1", 50, "007"));
        add(new Position(4, 1, 3, "A-01-1-01", "A区01号货架第1层01号仓位", "position", "1", 10, "007"));
        add(new Position(5, 1, 3, "A-01-1-02", "A区01号货架第1层02号仓位", "position", "1", 10, "007"));
        add(new Position(6, 1, 2, "A-01-2", "A区01号货架第2层", "level", "1", 50, "007"));
        add(new Position(7, 1, 6, "A-01-2-01", "A区01号货架第2层01号仓位", "position", "1", 10, "007"));
        add(new Position(8, 1, 1, "A-02", "A区02号货架", "shelf", "1", 100, "007"));
        add(new Position(9, 1, 8, "A-02-1", "A区02号货架第1层", "level", "1", 50, "007"));
        add(new Position(10, 1, 9, "A-02-1-01", "A区02号货架第1层01号仓位", "position", "1", 10, "007"));
        add(new Position(11, 2, null, "B区", "B区", "area", "1", 800, "007"));
        add(new Position(12, 2, 11, "B-01", "B区01号货架", "shelf", "1", 80, "007"));
        add(new Position(13, 2, 12, "B-01-1", "B区01号货架第1层", "level", "1", 40, "007"));
        add(new Position(14, 2, 13, "B-01-1-01", "B区01号货架第1层01号仓位", "position", "0", 8, "007"));
        add(new Position(15, 3, null, "C区", "C区", "area", "0", 600, "007"));
        add(new Position(16, 3, 15, "C-01", "C区01号货架", "shelf", "0", 60, "007"));
    }

    private void add(Position p) {
        positions.put(p.getId(), p);
    }

    public List<Position> listAll() {
        if (DbUtil.isEnabled()) {
            return listByWarehouseFromDb(null);
        }
        return new ArrayList<>(positions.values());
    }

    public List<Position> listByWarehouse(Integer warehouseId) {
        if (DbUtil.isEnabled()) {
            return listByWarehouseFromDb(warehouseId);
        }
        List<Position> res = new ArrayList<>();
        for (Position p : positions.values()) {
            if (warehouseId == null || p.getWarehouseId().equals(warehouseId)) {
                res.add(p);
            }
        }
        return res;
    }

    public Position findById(Integer id) {
        if (DbUtil.isEnabled()) {
            return findByIdFromDb(id);
        }
        return positions.get(id);
    }

    private List<Position> listByWarehouseFromDb(Integer warehouseId) {
        List<Position> res = new ArrayList<>();
        String sql = "SELECT id, warehouse_id, parent_id, code, name, type, status, max_capacity, unit FROM position"
                + (warehouseId == null ? "" : " WHERE warehouse_id = ?");
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (warehouseId != null) {
                ps.setInt(1, warehouseId);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Integer parentId = (Integer) rs.getObject("parent_id"); // allow null
                    res.add(new Position(
                            rs.getInt("id"),
                            rs.getInt("warehouse_id"),
                            parentId,
                            rs.getString("code"),
                            rs.getString("name"),
                            rs.getString("type"),
                            rs.getString("status"),
                            rs.getInt("max_capacity"),
                            rs.getString("unit")
                    ));
                }
            }
        } catch (SQLException e) {
            // DB 异常时兜底内存
            return listByWarehouse(warehouseId);
        }
        return res;
    }

    private Position findByIdFromDb(Integer id) {
        String sql = "SELECT id, warehouse_id, parent_id, code, name, type, status, max_capacity, unit FROM position WHERE id = ?";
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Integer parentId = (Integer) rs.getObject("parent_id");
                    return new Position(
                            rs.getInt("id"),
                            rs.getInt("warehouse_id"),
                            parentId,
                            rs.getString("code"),
                            rs.getString("name"),
                            rs.getString("type"),
                            rs.getString("status"),
                            rs.getInt("max_capacity"),
                            rs.getString("unit")
                    );
                }
            }
        } catch (SQLException e) {
            return positions.get(id);
        }
        return null;
    }
}
