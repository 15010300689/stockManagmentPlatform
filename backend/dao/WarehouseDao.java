package dao;

import model.Warehouse;
import util.DbUtil;
import java.sql.*;
import java.util.*;

public class WarehouseDao {
    private final Map<Integer, Warehouse> warehouses = new HashMap<>();

    public WarehouseDao() {
        // mock data
        add(new Warehouse(1, "WH001", "主仓库", "1", "北京市朝阳区xxx路xxx号", "张三", "13800138000"));
        add(new Warehouse(2, "WH002", "分仓库A", "1", "上海市浦东新区xxx路xxx号", "李四", "13900139000"));
        add(new Warehouse(3, "WH003", "分仓库B", "0", "广州市天河区xxx路xxx号", "王五", "13700137000"));
    }

    private void add(Warehouse w) {
        warehouses.put(w.getId(), w);
    }

    public List<Warehouse> listAll() {
        if (DbUtil.isEnabled()) {
            return listAllFromDb();
        }
        return new ArrayList<>(warehouses.values());
    }

    public Warehouse findById(Integer id) {
        if (DbUtil.isEnabled()) {
            return findByIdFromDb(id);
        }
        return warehouses.get(id);
    }

    private List<Warehouse> listAllFromDb() {
        List<Warehouse> res = new ArrayList<>();
        String sql = "SELECT id, code, name, status, address, contact, phone FROM warehouse";
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                res.add(new Warehouse(
                        rs.getInt("id"),
                        rs.getString("code"),
                        rs.getString("name"),
                        rs.getString("status"),
                        rs.getString("address"),
                        rs.getString("contact"),
                        rs.getString("phone")
                ));
            }
        } catch (SQLException e) {
            // DB 异常时兜底内存
            return new ArrayList<>(warehouses.values());
        }
        return res;
    }

    private Warehouse findByIdFromDb(Integer id) {
        String sql = "SELECT id, code, name, status, address, contact, phone FROM warehouse WHERE id = ?";
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Warehouse(
                            rs.getInt("id"),
                            rs.getString("code"),
                            rs.getString("name"),
                            rs.getString("status"),
                            rs.getString("address"),
                            rs.getString("contact"),
                            rs.getString("phone")
                    );
                }
            }
        } catch (SQLException e) {
            return warehouses.get(id);
        }
        return null;
    }
}
