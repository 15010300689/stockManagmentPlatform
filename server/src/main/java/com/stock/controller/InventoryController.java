package com.stock.controller;

import com.stock.dto.AdjustRequest;
import com.stock.dto.Result;
import com.stock.entity.Position;
import com.stock.entity.Warehouse;
import com.stock.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 仓库、仓位及库存控制器
 */
@RestController
@RequestMapping("/api")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    /**
     * GET /api/stores -- 仓库列表
     */
    @GetMapping("/stores")
    public Object listStores(@RequestParam(required = false) String keyword,
                             @RequestParam(required = false) String status,
                             @RequestParam(required = false) Integer pageNo,
                             @RequestParam(required = false) Integer pageSize) {
        if (pageNo == null || pageSize == null) {
            return inventoryService.getStores();
        }
        return inventoryService.getStoresByPage(keyword, status, pageNo, pageSize);
    }

    /**
     * POST /api/stores -- 新增仓库
     */
    @PostMapping("/stores")
    public ResponseEntity<Result> createStore(@RequestBody Warehouse warehouse) {
        Result result = inventoryService.createStore(warehouse);
        return result.isSuccess()
                ? ResponseEntity.ok(result)
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }

    /**
     * PUT /api/stores/{id} -- 编辑仓库
     */
    @PutMapping("/stores/{id}")
    public ResponseEntity<Result> updateStore(@PathVariable Integer id, @RequestBody Warehouse warehouse) {
        Result result = inventoryService.updateStore(id, warehouse);
        return result.isSuccess()
                ? ResponseEntity.ok(result)
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }

    /**
     * DELETE /api/stores/{id} -- 删除仓库
     */
    @DeleteMapping("/stores/{id}")
    public ResponseEntity<Result> deleteStore(@PathVariable Integer id) {
        Result result = inventoryService.deleteStore(id);
        return result.isSuccess()
                ? ResponseEntity.ok(result)
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }

    /**
     * GET /api/positions?warehouseId=1
     */
    @GetMapping("/positions")
    public Object listPositions(@RequestParam(required = false) Integer warehouseId,
                                @RequestParam(required = false) String code,
                                @RequestParam(required = false) String type,
                                @RequestParam(required = false) String status,
                                @RequestParam(required = false) Integer pageNo,
                                @RequestParam(required = false) Integer pageSize) {
        if (pageNo == null || pageSize == null) {
            return inventoryService.getPositions(warehouseId);
        }
        return inventoryService.getPositionsByPage(warehouseId, code, type, status, pageNo, pageSize);
    }

    /**
     * POST /api/positions -- 新增仓位
     */
    @PostMapping("/positions")
    public ResponseEntity<Result> createPosition(@RequestBody Position position) {
        Result result = inventoryService.createPosition(position);
        return result.isSuccess()
                ? ResponseEntity.ok(result)
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }

    /**
     * PUT /api/positions/{id} -- 编辑仓位
     */
    @PutMapping("/positions/{id}")
    public ResponseEntity<Result> updatePosition(@PathVariable Integer id, @RequestBody Position position) {
        Result result = inventoryService.updatePosition(id, position);
        return result.isSuccess()
                ? ResponseEntity.ok(result)
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }

    /**
     * DELETE /api/positions/{id} -- 删除仓位
     */
    @DeleteMapping("/positions/{id}")
    public ResponseEntity<Result> deletePosition(@PathVariable Integer id) {
        Result result = inventoryService.deletePosition(id);
        return result.isSuccess()
                ? ResponseEntity.ok(result)
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }

    /**
     * GET /api/inventory/summary?productId=P001
     */
    @GetMapping("/inventory/summary")
    public Object getInventorySummary(@RequestParam Long productId) {
        if (productId == null) {
            return Result.error("缺少productId");
        }
        return inventoryService.getWarehouseSummary(productId);
    }

    /**
     * GET /api/inventory/positions?productId=P001&warehouseId=1
     */
    @GetMapping("/inventory/positions")
    public Object getInventoryPositions(@RequestParam Long productId,
                                        @RequestParam(required = false) Integer warehouseId) {
        if (productId == null) {
            return Result.error("缺少productId");
        }
        return inventoryService.getPositionSummary(productId, warehouseId);
    }

    /**
     * POST /api/inventory/adjust -- 库存调整
     */
    /**
     * GET /api/stores/{warehouseId}/inventory — 按仓库查库存（推荐）
     */
    @GetMapping("/stores/{warehouseId}/inventory")
    public Object getStoreInventory(@PathVariable("warehouseId") Integer warehouseId,
                                    @RequestParam(required = false, defaultValue = "false") boolean overview) {
        if (overview) {
            return inventoryService.getWarehouseInventoryOverview(warehouseId);
        }
        return inventoryService.getInventoryByWarehouse(warehouseId);
    }

    /**
     * GET /api/stores/{warehouseId}/inventory/overview — 仓库库存概览（仓位占用+商品）
     */
    @GetMapping("/stores/{warehouseId}/inventory/overview")
    public Object getStoreInventoryOverview(@PathVariable("warehouseId") Integer warehouseId) {
        return inventoryService.getWarehouseInventoryOverview(warehouseId);
    }

    /**
     * GET /api/stores/{warehouseId}/position-occupancy — 仓位占用摘要
     */
    @GetMapping("/stores/{warehouseId}/position-occupancy")
    public Object getPositionOccupancy(@PathVariable("warehouseId") Integer warehouseId) {
        return inventoryService.getPositionOccupancyMap(warehouseId);
    }

    /**
     * GET /api/positions/{positionId}/inventory — 按仓位查库存（推荐）
     */
    @GetMapping("/positions/{positionId}/inventory")
    public Object getPositionInventory(@PathVariable("positionId") Integer positionId,
                                       @RequestParam(required = false, defaultValue = "false") boolean overview) {
        if (overview) {
            return inventoryService.getPositionInventoryOverview(positionId);
        }
        return inventoryService.getInventoryByPosition(positionId);
    }

    /**
     * GET /api/positions/{positionId}/inventory/overview — 仓位库存概览
     */
    @GetMapping("/positions/{positionId}/inventory/overview")
    public Object getPositionInventoryOverview(@PathVariable("positionId") Integer positionId) {
        return inventoryService.getPositionInventoryOverview(positionId);
    }

    /**
     * GET /api/inventory/by-warehouse?warehouseId=1 — 兼容旧路径
     */
    @GetMapping("/inventory/by-warehouse")
    public Object getInventoryByWarehouse(@RequestParam Integer warehouseId) {
        if (warehouseId == null) {
            return Result.error("缺少 warehouseId");
        }
        return inventoryService.getInventoryByWarehouse(warehouseId);
    }

    /**
     * GET /api/inventory/by-position?positionId=3 — 兼容旧路径
     */
    @GetMapping("/inventory/by-position")
    public Object getInventoryByPosition(@RequestParam Integer positionId) {
        if (positionId == null) {
            return Result.error("缺少 positionId");
        }
        return inventoryService.getInventoryByPosition(positionId);
    }

    /**
     * GET /api/inventory/logs?productId=1&warehouseId=1&positionId=3
     */
    @GetMapping("/inventory/logs")
    public Object getInventoryLogs(@RequestParam(required = false) Long productId,
                                   @RequestParam(required = false) Integer warehouseId,
                                   @RequestParam(required = false) Integer positionId) {
        return inventoryService.getInventoryLogs(productId, warehouseId, positionId);
    }

    /**
     * POST /api/inventory/adjust -- 库存调整
     */
    @PostMapping("/inventory/adjust")
    public Result adjustInventory(@RequestBody AdjustRequest req) {
        if (req.getProductId() == null || req.getWarehouseId() == null
                || req.getAmount() == null || req.getAmount() <= 0
                || req.getType() == null) {
            return Result.error("参数不完整");
        }
        try {
            boolean success = inventoryService.adjustInventory(
                    req.getProductId(), req.getWarehouseId(), req.getPositionId(),
                    req.getAmount(), req.getType(), req.getRemark());
            if (success) {
                return Result.ok("操作成功");
            }
            return Result.error("操作失败，库存不足或商品不存在");
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        }
    }
}
