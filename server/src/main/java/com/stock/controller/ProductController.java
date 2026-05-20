package com.stock.controller;

import com.stock.dto.Result;
import com.stock.dto.StockRequest;
import com.stock.entity.Product;
import com.stock.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 商品管理控制器
 */
@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * GET /api/products?pageNo=1&pageSize=10
     * 支持 name/category 条件分页查询
     */
    @GetMapping("/products")
    public Map<String, Object> listProducts(@RequestParam(required = false) String name,
                                            @RequestParam(required = false) String category,
                                            @RequestParam(defaultValue = "1") Integer pageNo,
                                            @RequestParam(defaultValue = "10") Integer pageSize) {
        return productService.getProductsByPage(name, category, pageNo, pageSize);
    }

    /**
     * GET /api/product?id=数字
     */
    @GetMapping("/product")
    public Object getProduct(@RequestParam Long id) {
        Product product = productService.findById(id);
        if (product == null) {
            return Result.error("商品不存在");
        }
        return product;
    }

    /**
     * POST /api/products -- 新增商品（id 由数据库生成，请求体勿传 id）
     */
    @PostMapping("/products")
    public Result addProduct(@RequestBody Product product) {
        product.setQuantity(0);
        try {
            Product saved = productService.addProduct(product);
            return Result.ok("商品添加成功", saved);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * PUT /api/product?id=xxx -- 更新商品
     */
    @PutMapping("/product")
    public Result updateProduct(@RequestParam Long id, @RequestBody Product product) {
        product.setId(id);
        try {
            if (productService.updateProduct(product)) {
                return Result.ok("商品更新成功");
            }
            return Result.error("更新失败，商品可能不存在");
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * DELETE /api/product?id=xxx -- 删除商品
     */
    @DeleteMapping("/product")
    public Result deleteProduct(@RequestParam Long id) {
        if (productService.deleteProduct(id)) {
            return Result.ok("商品删除成功");
        }
        return Result.error("删除失败");
    }

    /**
     * POST /api/stock-in -- 入库
     */
    @PostMapping("/stock-in")
    public Result stockIn(@RequestBody StockRequest req) {
        if (req.getId() == null) {
            return Result.error("缺少商品 id");
        }
        if (req.getWarehouseId() == null) {
            return Result.error("请选择仓库");
        }
        if (req.getAmount() == null || req.getAmount() <= 0) {
            return Result.error("入库数量必须大于 0");
        }
        if (productService.stockIn(req.getId(), req.getWarehouseId(), req.getPositionId(),
                req.getAmount(), req.getRemark())) {
            return Result.ok("入库成功");
        }
        return Result.error("入库失败，请检查仓库/仓位是否正确");
    }

    /**
     * POST /api/stock-out -- 出库
     */
    @PostMapping("/stock-out")
    public Result stockOut(@RequestBody StockRequest req) {
        if (req.getId() == null) {
            return Result.error("缺少商品 id");
        }
        if (req.getWarehouseId() == null) {
            return Result.error("请选择仓库");
        }
        if (req.getAmount() == null || req.getAmount() <= 0) {
            return Result.error("出库数量必须大于 0");
        }
        if (productService.stockOut(req.getId(), req.getWarehouseId(), req.getPositionId(),
                req.getAmount(), req.getRemark())) {
            return Result.ok("出库成功");
        }
        return Result.error("出库失败，该仓库/仓位库存不足或参数无效");
    }

    /**
     * GET /api/statistics -- 统计信息
     */
    @GetMapping("/statistics")
    public Map<String, Object> getStatistics() {
        return productService.getStatistics();
    }

    /**
     * GET /api/low-stock?threshold=10
     */
    @GetMapping("/low-stock")
    public List<Product> getLowStock(@RequestParam(defaultValue = "10") int threshold) {
        return productService.getLowStockProducts(threshold);
    }
}
