package service;

import dao.InventoryDao;
import dao.PositionDao;
import dao.ProductDao;
import dao.WarehouseDao;
import model.InventoryRecord;
import model.Position;
import model.Product;
import model.Warehouse;

import java.util.*;

public class InventoryService {
    private final WarehouseDao warehouseDao;
    private final PositionDao positionDao;
    private final InventoryDao inventoryDao;
    private final ProductDao productDao;

    public InventoryService(WarehouseDao warehouseDao, PositionDao positionDao, InventoryDao inventoryDao, ProductDao productDao) {
        this.warehouseDao = warehouseDao;
        this.positionDao = positionDao;
        this.inventoryDao = inventoryDao;
        this.productDao = productDao;
    }

    public List<Warehouse> getStores() {
        return warehouseDao.listAll();
    }

    public List<Position> getPositions(Integer warehouseId) {
        return positionDao.listByWarehouse(warehouseId);
    }

    public List<Map<String, Object>> getWarehouseSummary(String productId) {
        List<Map<String, Object>> result = new ArrayList<>();
        List<InventoryRecord> records = inventoryDao.listByProduct(productId);
        Map<Integer, Integer> sum = new HashMap<>();
        for (InventoryRecord r : records) {
            sum.put(r.getWarehouseId(), sum.getOrDefault(r.getWarehouseId(), 0) + r.getQuantity());
        }
        for (Warehouse w : warehouseDao.listAll()) {
            Map<String, Object> row = new HashMap<>();
            row.put("warehouseId", w.getId());
            row.put("warehouseName", w.getName());
            row.put("status", w.getStatus());
            row.put("available", sum.getOrDefault(w.getId(), 0));
            row.put("reserved", 0);
            row.put("total", sum.getOrDefault(w.getId(), 0));
            result.add(row);
        }
        return result;
    }

    public List<Map<String, Object>> getPositionSummary(String productId, Integer warehouseId) {
        List<Map<String, Object>> result = new ArrayList<>();
        List<InventoryRecord> records = warehouseId == null
                ? inventoryDao.listByProduct(productId)
                : inventoryDao.listByProductAndWarehouse(productId, warehouseId);

        for (InventoryRecord r : records) {
            Map<String, Object> row = new HashMap<>();
            Position p = r.getPositionId() == null ? null : positionDao.findById(r.getPositionId());
            Warehouse w = warehouseDao.findById(r.getWarehouseId());
            row.put("warehouseId", r.getWarehouseId());
            row.put("warehouseName", w != null ? w.getName() : "");
            row.put("positionId", r.getPositionId());
            row.put("positionName", p != null ? p.getName() : "");
            row.put("code", p != null ? p.getCode() : "");
            row.put("quantity", r.getQuantity());
            result.add(row);
        }
        return result;
    }

    public boolean adjustInventory(String productId, Integer warehouseId, Integer positionId, int amount, String type) {
        Product product = productDao.findProductById(productId);
        if (product == null) return false;
        boolean ok = inventoryDao.adjust(productId, warehouseId, positionId, amount, type);
        if (!ok) return false;
        if ("in".equals(type)) {
            product.addQuantity(amount);
        } else if ("out".equals(type)) {
            if (!product.reduceQuantity(amount)) {
                return false;
            }
        }
        return true;
    }
}
