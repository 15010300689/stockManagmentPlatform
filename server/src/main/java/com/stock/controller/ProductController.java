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
     * GET /api/products          -- 全部商品
     * GET /api/products?name=xxx -- 按名称搜索
     * GET /api/products?category=xxx -- 按类别搜索
     */
    @GetMapping("/products")
    public List<Product> listProducts(@RequestParam(required = false) String name,
                                      @RequestParam(required = false) String category) {
        if (name != null && !name.isEmpty()) {
            return productService.findByName(name);
        }
        if (category != null && !category.isEmpty()) {
            return productService.findByCategory(category);
        }
        return productService.getAllProducts();
    }

    /**
     * GET /api/product?id=xxx
     */
    @GetMapping("/product")
    public Object getProduct(@RequestParam String id) {
        Product product = productService.findById(id);
        if (product == null) {
            return Result.error("商品不存在");
        }
        return product;
    }

    /**
     * POST /api/products -- 新增商品
     */
    @PostMapping("/products")
    public Result addProduct(@RequestBody Product product) {
        if (productService.addProduct(product)) {
            return Result.ok("商品添加成功");
        }
        return Result.error("添加失败，请检查商品信息");
    }

    /**
     * PUT /api/product?id=xxx -- 更新商品
     */
    @PutMapping("/product")
    public Result updateProduct(@RequestParam String id, @RequestBody Product product) {
        product.setId(id);
        if (productService.updateProduct(product)) {
            return Result.ok("商品更新成功");
        }
        return Result.error("更新失败");
    }

    /**
     * DELETE /api/product?id=xxx -- 删除商品
     */
    @DeleteMapping("/product")
    public Result deleteProduct(@RequestParam String id) {
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
        if (productService.stockIn(req.getId(), req.getAmount())) {
            return Result.ok("入库成功");
        }
        return Result.error("入库失败");
    }

    /**
     * POST /api/stock-out -- 出库
     */
    @PostMapping("/stock-out")
    public Result stockOut(@RequestBody StockRequest req) {
        if (productService.stockOut(req.getId(), req.getAmount())) {
            return Result.ok("出库成功");
        }
        return Result.error("出库失败，库存不足");
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
