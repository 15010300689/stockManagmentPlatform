package com.stock.service;

import com.stock.entity.*;
import com.stock.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class InventoryService {

    @Autowired
    private WarehouseMapper warehouseMapper;
    @Autowired
    private PositionMapper positionMapper;
    @Autowired
    private InventoryMapper inventoryMapper;
    @Autowired
    private ProductMapper productMapper;

    public List<Warehouse> getStores() {
        return warehouseMapper.findAll();
    }

    public List<Position> getPositions(Integer warehouseId) {
        if (warehouseId != null) {
            return positionMapper.findByWarehouseId(warehouseId);
        }
        return positionMapper.findAll();
    }

    /**
     * 商品在各仓库的库存汇总
     */
    public List<Map<String, Object>> getWarehouseSummary(String productId) {
        List<Map<String, Object>> result = new ArrayList<>();
        List<Inventory> records = inventoryMapper.findByProductId(productId);

        // 按仓库汇总
        Map<Integer, Integer> sumMap = new HashMap<>();
        for (Inventory r : records) {
            sumMap.merge(r.getWarehouseId(), r.getQuantity(), Integer::sum);
        }

        for (Warehouse w : warehouseMapper.findAll()) {
            Map<String, Object> row = new HashMap<>();
            row.put("warehouseId", w.getId());
            row.put("warehouseName", w.getName());
            row.put("status", w.getStatus());
            row.put("available", sumMap.getOrDefault(w.getId(), 0));
            row.put("reserved", 0);
            row.put("total", sumMap.getOrDefault(w.getId(), 0));
            result.add(row);
        }
        return result;
    }

    /**
     * 商品在仓位维度的库存明细
     */
    public List<Map<String, Object>> getPositionSummary(String productId, Integer warehouseId) {
        List<Map<String, Object>> result = new ArrayList<>();
        List<Inventory> records = (warehouseId == null)
                ? inventoryMapper.findByProductId(productId)
                : inventoryMapper.findByProductAndWarehouse(productId, warehouseId);

        for (Inventory r : records) {
            Map<String, Object> row = new HashMap<>();
            Warehouse w = warehouseMapper.findById(r.getWarehouseId());
            Position p = (r.getPositionId() != null) ? positionMapper.findById(r.getPositionId()) : null;
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

    /**
     * 库存调整（入库/出库），事务控制保证一致性
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean adjustInventory(String productId, Integer warehouseId, Integer positionId,
                                   int amount, String type, String remark) {
        Product product = productMapper.findById(productId);
        if (product == null) return false;
        if (amount <= 0) return false;

        // 查找或创建库存记录
        Inventory inv = inventoryMapper.findOne(productId, warehouseId, positionId);

        if ("in".equals(type)) {
            if (inv == null) {
                Inventory newInv = new Inventory();
                newInv.setProductId(productId);
                newInv.setWarehouseId(warehouseId);
                newInv.setPositionId(positionId);
                newInv.setQuantity(amount);
                inventoryMapper.insert(newInv);
            } else {
                inventoryMapper.updateQuantity(productId, warehouseId, positionId, inv.getQuantity() + amount);
            }
            // 同步更新商品总库存
            productMapper.addQuantity(productId, amount);

        } else if ("out".equals(type)) {
            if (inv == null || inv.getQuantity() < amount) {
                return false; // 库存不足
            }
            inventoryMapper.updateQuantity(productId, warehouseId, positionId, inv.getQuantity() - amount);
            int affected = productMapper.reduceQuantity(productId, amount);
            if (affected == 0) return false;

        } else {
            return false;
        }

        // 写入库存流水
        InventoryLog log = new InventoryLog();
        log.setProductId(productId);
        log.setWarehouseId(warehouseId);
        log.setPositionId(positionId);
        log.setType(type);
        log.setAmount(amount);
        log.setRemark(remark);
        inventoryMapper.insertLog(log);

        return true;
    }
}
