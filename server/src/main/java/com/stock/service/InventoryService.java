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
            if (isDescendantOf(targetParentId, id)) {
                return Result.error("上级层级不能选择当前仓位的下级层级");
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

    private boolean isDescendantOf(Integer possibleDescendantId, Integer ancestorId) {
        Integer cursor = possibleDescendantId;
        Set<Integer> visited = new HashSet<>();
        while (cursor != null) {
            if (Objects.equals(cursor, ancestorId)) {
                return true;
            }
            if (!visited.add(cursor)) {
                return true;
            }
            Position current = positionMapper.findById(cursor);
            cursor = current == null ? null : current.getParentId();
        }
        return false;
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
     * 将库存行 enrich 为前端展示结构
     */
    private List<Map<String, Object>> enrichInventoryRows(List<Inventory> records) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Inventory r : records) {
            Map<String, Object> row = new HashMap<>();
            Product p = productMapper.findById(r.getProductId());
            Warehouse w = warehouseMapper.findById(r.getWarehouseId());
            Position pos = (r.getPositionId() != null) ? positionMapper.findById(r.getPositionId()) : null;
            row.put("productId", r.getProductId());
            row.put("productName", p != null ? p.getName() : "");
            row.put("warehouseId", r.getWarehouseId());
            row.put("warehouseName", w != null ? w.getName() : "");
            row.put("positionId", r.getPositionId());
            row.put("positionCode", pos != null ? pos.getCode() : "");
            row.put("positionName", pos != null ? (pos.getName() != null ? pos.getName() : pos.getCode()) : "");
            row.put("quantity", r.getQuantity());
            row.put("updateTime", r.getUpdateTime());
            result.add(row);
        }
        return result;
    }

    public List<Map<String, Object>> getInventoryByWarehouse(Integer warehouseId) {
        if (warehouseId == null) {
            return Collections.emptyList();
        }
        if (warehouseMapper.findById(warehouseId) == null) {
            return Collections.emptyList();
        }
        return enrichInventoryRows(inventoryMapper.findByWarehouseId(warehouseId));
    }

    public List<Map<String, Object>> getInventoryByPosition(Integer positionId) {
        if (positionId == null) {
            return Collections.emptyList();
        }
        Position position = positionMapper.findById(positionId);
        if (position == null) {
            return Collections.emptyList();
        }
        return enrichInventoryRows(inventoryMapper.findByPositionId(positionId));
    }

    private List<Map<String, Object>> toProductBriefList(List<Inventory> inventories) {
        List<Map<String, Object>> products = new ArrayList<>();
        for (Inventory inv : inventories) {
            Product prod = productMapper.findById(inv.getProductId());
            Map<String, Object> row = new HashMap<>();
            row.put("productId", inv.getProductId());
            row.put("productName", prod != null ? prod.getName() : "");
            row.put("quantity", inv.getQuantity());
            products.add(row);
        }
        return products;
    }

    private Map<String, Object> buildCapacityMetrics(int used, Integer maxCapacity) {
        Map<String, Object> metrics = new HashMap<>();
        int max = maxCapacity == null ? 0 : maxCapacity;
        metrics.put("usedQuantity", used);
        if (max > 0) {
            metrics.put("maxCapacity", max);
            metrics.put("remainingQuantity", Math.max(max - used, 0));
            metrics.put("utilizationPercent", Math.min(100, (int) Math.round(used * 100.0 / max)));
        } else {
            metrics.put("maxCapacity", 0);
            metrics.put("remainingQuantity", null);
            metrics.put("utilizationPercent", null);
        }
        return metrics;
    }

    /**
     * 仓库库存概览：按仓位汇总占用、剩余容量及商品列表
     */
    public Map<String, Object> getWarehouseInventoryOverview(Integer warehouseId) {
        Map<String, Object> result = new HashMap<>();
        Warehouse warehouse = warehouseMapper.findById(warehouseId);
        if (warehouse == null) {
            return result;
        }
        result.put("warehouseId", warehouseId);
        result.put("warehouseName", warehouse.getName());

        List<Inventory> inventories = inventoryMapper.findByWarehouseId(warehouseId);
        Map<Integer, List<Inventory>> grouped = new LinkedHashMap<>();
        for (Inventory inv : inventories) {
            int groupKey = inv.getPositionId() == null ? 0 : inv.getPositionId();
            grouped.computeIfAbsent(groupKey, k -> new ArrayList<>()).add(inv);
        }

        List<Map<String, Object>> slots = new ArrayList<>();
        int totalQuantity = 0;
        for (Map.Entry<Integer, List<Inventory>> entry : grouped.entrySet()) {
            List<Inventory> list = entry.getValue();
            int used = list.stream().mapToInt(Inventory::getQuantity).sum();
            totalQuantity += used;

            Map<String, Object> slot = new HashMap<>();
            Integer posId = entry.getKey();
            if (posId == 0) {
                slot.put("positionId", null);
                slot.put("positionCode", "—");
                slot.put("positionName", "仓库级（未指定仓位）");
                slot.put("type", "warehouse");
                slot.put("unit", "件");
                slot.putAll(buildCapacityMetrics(used, 0));
            } else {
                Position position = positionMapper.findById(posId);
                int maxCap = position != null && position.getMaxCapacity() != null ? position.getMaxCapacity() : 0;
                slot.put("positionId", posId);
                slot.put("positionCode", position != null ? position.getCode() : "");
                slot.put("positionName", position != null ? (position.getName() != null ? position.getName() : position.getCode()) : "");
                slot.put("type", position != null ? position.getType() : "");
                slot.put("unit", position != null && position.getUnit() != null ? position.getUnit() : "件");
                slot.putAll(buildCapacityMetrics(used, maxCap));
            }
            slot.put("skuCount", list.size());
            slot.put("products", toProductBriefList(list));
            slots.add(slot);
        }

        slots.sort((a, b) -> {
            Integer idA = (Integer) a.get("positionId");
            Integer idB = (Integer) b.get("positionId");
            if (idA == null && idB != null) return -1;
            if (idA != null && idB == null) return 1;
            return String.valueOf(a.get("positionCode")).compareTo(String.valueOf(b.get("positionCode")));
        });

        result.put("slots", slots);
        result.put("totalQuantity", totalQuantity);
        result.put("totalSku", inventories.size());
        result.put("slotCount", slots.size());
        return result;
    }

    /**
     * 仓位库存概览：容量占用 + 商品明细
     */
    public Map<String, Object> getPositionInventoryOverview(Integer positionId) {
        Position position = positionMapper.findById(positionId);
        if (position == null) {
            return Collections.emptyMap();
        }
        List<Inventory> inventories = inventoryMapper.findByPositionId(positionId);
        int used = inventories.stream().mapToInt(Inventory::getQuantity).sum();
        int maxCap = position.getMaxCapacity() != null ? position.getMaxCapacity() : 0;

        Map<String, Object> result = new HashMap<>();
        result.put("positionId", positionId);
        result.put("positionCode", position.getCode());
        result.put("positionName", position.getName() != null ? position.getName() : position.getCode());
        result.put("type", position.getType());
        result.put("warehouseId", position.getWarehouseId());
        Warehouse warehouse = warehouseMapper.findById(position.getWarehouseId());
        result.put("warehouseName", warehouse != null ? warehouse.getName() : "");
        result.put("unit", position.getUnit() != null ? position.getUnit() : "件");
        result.putAll(buildCapacityMetrics(used, maxCap));
        result.put("skuCount", inventories.size());
        result.put("products", toProductBriefList(inventories));
        result.put("items", enrichInventoryRows(inventories));
        return result;
    }

    /**
     * 仓库下各仓位占用摘要（供仓位树列表展示）
     */
    public Map<Integer, Map<String, Object>> getPositionOccupancyMap(Integer warehouseId) {
        Map<Integer, Map<String, Object>> map = new HashMap<>();
        if (warehouseId == null) {
            return map;
        }
        List<Inventory> inventories = inventoryMapper.findByWarehouseId(warehouseId);
        Map<Integer, Integer> usedByPosition = new HashMap<>();
        Map<Integer, Integer> skuByPosition = new HashMap<>();
        for (Inventory inv : inventories) {
            if (inv.getPositionId() == null) {
                continue;
            }
            int posId = inv.getPositionId();
            usedByPosition.merge(posId, inv.getQuantity(), Integer::sum);
            skuByPosition.merge(posId, 1, Integer::sum);
        }
        for (Map.Entry<Integer, Integer> entry : usedByPosition.entrySet()) {
            Position position = positionMapper.findById(entry.getKey());
            if (position == null) {
                continue;
            }
            int used = entry.getValue();
            int maxCap = position.getMaxCapacity() != null ? position.getMaxCapacity() : 0;
            Map<String, Object> row = new HashMap<>();
            row.put("usedQuantity", used);
            row.put("skuCount", skuByPosition.get(entry.getKey()));
            row.put("maxCapacity", maxCap);
            row.put("unit", position.getUnit() != null ? position.getUnit() : "件");
            if (maxCap > 0) {
                row.put("remainingQuantity", Math.max(maxCap - used, 0));
                row.put("utilizationPercent", Math.min(100, (int) Math.round(used * 100.0 / maxCap)));
            }
            map.put(entry.getKey(), row);
        }
        return map;
    }

    public List<Map<String, Object>> getInventoryLogs(Long productId, Integer warehouseId, Integer positionId) {
        int limit = 100;
        List<InventoryLog> logs = inventoryMapper.findLogs(productId, warehouseId, positionId, limit);
        List<Map<String, Object>> result = new ArrayList<>();
        for (InventoryLog log : logs) {
            Map<String, Object> row = new HashMap<>();
            Product p = productMapper.findById(log.getProductId());
            Warehouse w = warehouseMapper.findById(log.getWarehouseId());
            Position pos = (log.getPositionId() != null) ? positionMapper.findById(log.getPositionId()) : null;
            row.put("id", log.getId());
            row.put("productId", log.getProductId());
            row.put("productName", p != null ? p.getName() : "");
            row.put("warehouseId", log.getWarehouseId());
            row.put("warehouseName", w != null ? w.getName() : "");
            row.put("positionId", log.getPositionId());
            row.put("positionName", pos != null ? (pos.getName() != null ? pos.getName() : pos.getCode()) : "");
            row.put("type", log.getType());
            row.put("typeLabel", "in".equals(log.getType()) ? "入库" : "out".equals(log.getType()) ? "出库" : log.getType());
            row.put("amount", log.getAmount());
            row.put("remark", log.getRemark());
            row.put("createTime", log.getCreateTime());
            result.add(row);
        }
        return result;
    }

    private boolean validateWarehouseAndPosition(Integer warehouseId, Integer positionId) {
        if (warehouseId == null) {
            return false;
        }
        if (warehouseMapper.findById(warehouseId) == null) {
            return false;
        }
        if (positionId == null) {
            return true;
        }
        Position position = positionMapper.findById(positionId);
        return position != null && warehouseId.equals(position.getWarehouseId());
    }

    private void validatePositionCapacity(Integer positionId, int incomingAmount) {
        if (positionId == null || incomingAmount <= 0) {
            return;
        }
        Position position = positionMapper.findById(positionId);
        if (position == null || position.getMaxCapacity() == null || position.getMaxCapacity() <= 0) {
            return;
        }
        int used = inventoryMapper.sumQuantityByPositionId(positionId);
        if (used + incomingAmount > position.getMaxCapacity()) {
            throw new IllegalArgumentException("入库失败，超过仓位最大容量");
        }
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
        if (!validateWarehouseAndPosition(warehouseId, positionId)) {
            return false;
        }

        // 查找或创建库存记录
        Inventory inv = inventoryMapper.findOne(productId, warehouseId, positionId);

        if ("in".equals(type)) {
            validatePositionCapacity(positionId, amount);
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
