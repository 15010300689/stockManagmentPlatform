package com.stock.controller;

import com.stock.dto.AdjustRequest;
import com.stock.dto.Result;
import com.stock.entity.Position;
import com.stock.entity.Warehouse;
import com.stock.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public List<Warehouse> listStores() {
        return inventoryService.getStores();
    }

    /**
     * GET /api/positions?warehouseId=1
     */
    @GetMapping("/positions")
    public List<Position> listPositions(@RequestParam(required = false) Integer warehouseId) {
        return inventoryService.getPositions(warehouseId);
    }

    /**
     * GET /api/inventory/summary?productId=P001
     */
    @GetMapping("/inventory/summary")
    public Object getInventorySummary(@RequestParam String productId) {
        if (productId == null || productId.isEmpty()) {
            return Result.error("缺少productId");
        }
        return inventoryService.getWarehouseSummary(productId);
    }

    /**
     * GET /api/inventory/positions?productId=P001&warehouseId=1
     */
    @GetMapping("/inventory/positions")
    public Object getInventoryPositions(@RequestParam String productId,
                                        @RequestParam(required = false) Integer warehouseId) {
        if (productId == null || productId.isEmpty()) {
            return Result.error("缺少productId");
        }
        return inventoryService.getPositionSummary(productId, warehouseId);
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
        boolean success = inventoryService.adjustInventory(
                req.getProductId(), req.getWarehouseId(), req.getPositionId(),
                req.getAmount(), req.getType(), req.getRemark());
        if (success) {
            return Result.ok("操作成功");
        }
        return Result.error("操作失败，库存不足或商品不存在");
    }
}
