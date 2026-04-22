package com.stock.service;

import com.stock.dto.Result;
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

    public Map<String, Object> getStoresByPage(String keyword, String status, Integer pageNo, Integer pageSize) {
        int safePageNo = (pageNo == null || pageNo < 1) ? 1 : pageNo;
        int safePageSize = (pageSize == null || pageSize < 1) ? 10 : Math.min(pageSize, 100);
        String safeKeyword = keyword == null ? null : keyword.trim();
        String safeStatus = status == null ? null : status.trim();
        int offset = (safePageNo - 1) * safePageSize;

        int total = warehouseMapper.countByCondition(safeKeyword, safeStatus);
        List<Warehouse> list = total <= 0
                ? Collections.emptyList()
                : warehouseMapper.findPageByCondition(safeKeyword, safeStatus, offset, safePageSize);

        Map<String, Object> result = new HashMap<>();
        result.put("data", list);
        result.put("total", total);
        result.put("pageNo", safePageNo);
        result.put("pageSize", safePageSize);
        return result;
    }

    public Result createStore(Warehouse warehouse) {
        if (warehouse == null || warehouse.getCode() == null || warehouse.getCode().trim().isEmpty()
                || warehouse.getName() == null || warehouse.getName().trim().isEmpty()) {
            return Result.error("仓库编码和仓库名称不能为空");
        }
        Warehouse old = warehouseMapper.findByCode(warehouse.getCode().trim());
        if (old != null) {
            return Result.error("仓库编码已存在");
        }

        if (warehouse.getStatus() == null || warehouse.getStatus().trim().isEmpty()) {
            warehouse.setStatus("1");
        }
        int rows = warehouseMapper.insert(warehouse);
        if (rows > 0) {
            return Result.ok("新增仓库成功", warehouse);
        }
        return Result.error("新增仓库失败");
    }

    public Result updateStore(Integer id, Warehouse warehouse) {
        if (id == null) {
            return Result.error("缺少仓库ID");
        }
        Warehouse old = warehouseMapper.findById(id);
        if (old == null) {
            return Result.error("仓库不存在");
        }
        if (warehouse == null) {
            return Result.error("请求参数不能为空");
        }

        String newCode = (warehouse.getCode() == null || warehouse.getCode().trim().isEmpty())
                ? old.getCode() : warehouse.getCode().trim();
        if (!newCode.equals(old.getCode())) {
            Warehouse sameCode = warehouseMapper.findByCode(newCode);
            if (sameCode != null && !sameCode.getId().equals(id)) {
                return Result.error("仓库编码已存在");
            }
        }

        warehouse.setId(id);
        warehouse.setCode(newCode);
        if (warehouse.getName() == null || warehouse.getName().trim().isEmpty()) {
            warehouse.setName(old.getName());
        }
        if (warehouse.getStatus() == null || warehouse.getStatus().trim().isEmpty()) {
            warehouse.setStatus(old.getStatus());
        }
        if (warehouse.getAddress() == null) {
            warehouse.setAddress(old.getAddress());
        }
        if (warehouse.getContact() == null) {
            warehouse.setContact(old.getContact());
        }
        if (warehouse.getPhone() == null) {
            warehouse.setPhone(old.getPhone());
        }

        int rows = warehouseMapper.update(warehouse);
        if (rows > 0) {
            return Result.ok("编辑仓库成功");
        }
        return Result.error("编辑仓库失败");
    }

    public Result deleteStore(Integer id) {
        if (id == null) {
            return Result.error("缺少仓库ID");
        }
        Warehouse old = warehouseMapper.findById(id);
        if (old == null) {
            return Result.error("仓库不存在");
        }
        try {
            int rows = warehouseMapper.deleteById(id);
            if (rows > 0) {
                return Result.ok("删除仓库成功");
            }
            return Result.error("删除仓库失败");
        } catch (Exception e) {
            return Result.error("删除失败，仓库已被仓位或库存数据引用");
        }
    }

    public List<Position> getPositions(Integer warehouseId) {
        if (warehouseId != null) {
            return positionMapper.findByWarehouseId(warehouseId);
        }
        return positionMapper.findAll();
    }

    public Map<String, Object> getPositionsByPage(Integer warehouseId, String code, String type, String status, Integer pageNo, Integer pageSize) {
        int safePageNo = (pageNo == null || pageNo < 1) ? 1 : pageNo;
        int safePageSize = (pageSize == null || pageSize < 1) ? 10 : Math.min(pageSize, 100);
        String safeCode = code == null ? null : code.trim();
        String safeType = type == null ? null : type.trim();
        String safeStatus = status == null ? null : status.trim();
        int offset = (safePageNo - 1) * safePageSize;

        int total = positionMapper.countByCondition(warehouseId, safeCode, safeType, safeStatus);
        List<Position> list = total <= 0
                ? Collections.emptyList()
                : positionMapper.findPageByCondition(warehouseId, safeCode, safeType, safeStatus, offset, safePageSize);

        Map<String, Object> result = new HashMap<>();
        result.put("data", list);
        result.put("total", total);
        result.put("pageNo", safePageNo);
        result.put("pageSize", safePageSize);
        return result;
    }

    public Result createPosition(Position position) {
        if (position == null || position.getWarehouseId() == null
                || position.getCode() == null || position.getCode().trim().isEmpty()
                || position.getType() == null || position.getType().trim().isEmpty()) {
            return Result.error("参数不完整");
        }
        Warehouse warehouse = warehouseMapper.findById(position.getWarehouseId());
        if (warehouse == null) {
            return Result.error("仓库不存在");
        }
        String code = position.getCode().trim();
        Position old = positionMapper.findByCodeInWarehouse(position.getWarehouseId(), code);
        if (old != null) {
            return Result.error("同仓库下仓位编码已存在");
        }

        if (position.getParentId() != null) {
            Position parent = positionMapper.findById(position.getParentId());
            if (parent == null) {
                return Result.error("上级层级不存在");
            }
            if (!Objects.equals(parent.getWarehouseId(), position.getWarehouseId())) {
                return Result.error("上级层级与所属仓库不一致");
            }
        }

        position.setCode(code);
        if (position.getName() == null || position.getName().trim().isEmpty()) {
            position.setName(code);
        }
        if (position.getStatus() == null || position.getStatus().trim().isEmpty()) {
            position.setStatus("1");
        }
        if (position.getMaxCapacity() == null) {
            position.setMaxCapacity(0);
        }
        int rows = positionMapper.insert(position);
        if (rows > 0) {
            return Result.ok("新增仓位成功", position);
        }
        return Result.error("新增仓位失败");
    }

    public Result updatePosition(Integer id, Position position) {
        if (id == null) {
            return Result.error("缺少仓位ID");
        }
        Position old = positionMapper.findById(id);
        if (old == null) {
            return Result.error("仓位不存在");
        }
        if (position == null) {
            return Result.error("请求参数不能为空");
        }

        Integer targetWarehouseId = position.getWarehouseId() != null ? position.getWarehouseId() : old.getWarehouseId();
        Warehouse warehouse = warehouseMapper.findById(targetWarehouseId);
        if (warehouse == null) {
            return Result.error("仓库不存在");
        }
        String targetCode = (position.getCode() == null || position.getCode().trim().isEmpty())
                ? old.getCode() : position.getCode().trim();
        Position sameCode = positionMapper.findByCodeInWarehouse(targetWarehouseId, targetCode);
        if (sameCode != null && !sameCode.getId().equals(id)) {
            return Result.error("同仓库下仓位编码已存在");
        }

        Integer targetParentId = position.getParentId() != null ? position.getParentId() : old.getParentId();
        if (targetParentId != null) {
            if (Objects.equals(targetParentId, id)) {
                return Result.error("上级层级不能是自己");
            }
            Position parent = positionMapper.findById(targetParentId);
            if (parent == null) {
                return Result.error("上级层级不存在");
            }
            if (!Objects.equals(parent.getWarehouseId(), targetWarehouseId)) {
                return Result.error("上级层级与所属仓库不一致");
            }
        }

        position.setId(id);
        position.setWarehouseId(targetWarehouseId);
        position.setCode(targetCode);
        if (position.getName() == null || position.getName().trim().isEmpty()) {
            position.setName(old.getName());
        }
        if (position.getType() == null || position.getType().trim().isEmpty()) {
            position.setType(old.getType());
        }
        if (position.getStatus() == null || position.getStatus().trim().isEmpty()) {
            position.setStatus(old.getStatus());
        }
        if (position.getMaxCapacity() == null) {
            position.setMaxCapacity(old.getMaxCapacity());
        }
        if (position.getUnit() == null) {
            position.setUnit(old.getUnit());
        }
        if (position.getParentId() == null && old.getParentId() != null) {
            position.setParentId(old.getParentId());
        }

        int rows = positionMapper.update(position);
        if (rows > 0) {
            return Result.ok("编辑仓位成功");
        }
        return Result.error("编辑仓位失败");
    }

    public Result deletePosition(Integer id) {
        if (id == null) {
            return Result.error("缺少仓位ID");
        }
        Position old = positionMapper.findById(id);
        if (old == null) {
            return Result.error("仓位不存在");
        }
        List<Position> children = positionMapper.findChildrenByParentId(id);
        if (children != null && !children.isEmpty()) {
            return Result.error("请先删除下级层级");
        }
        try {
            int rows = positionMapper.deleteById(id);
            if (rows > 0) {
                return Result.ok("删除仓位成功");
            }
            return Result.error("删除仓位失败");
        } catch (Exception e) {
            return Result.error("删除失败，仓位已被库存数据引用");
        }
    }

    /**
     * 商品在各仓库的库存汇总
     */
    public List<Map<String, Object>> getWarehouseSummary(Long productId) {
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
    public List<Map<String, Object>> getPositionSummary(Long productId, Integer warehouseId) {
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
    public boolean adjustInventory(Long productId, Integer warehouseId, Integer positionId,
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
