package com.stock.service;

import com.stock.entity.Product;
import com.stock.mapper.ProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ProductService {

    @Autowired
    private ProductMapper productMapper;

    public List<Product> getAllProducts() {
        return productMapper.findAll();
    }

    public List<Product> findByName(String name) {
        return productMapper.findByName(name);
    }

    public List<Product> findByCategory(String category) {
        return productMapper.findByCategory(category);
    }

    public Product findById(String id) {
        return productMapper.findById(id);
    }

    public boolean addProduct(Product product) {
        if (product.getId() == null || product.getId().trim().isEmpty()) {
            return false;
        }
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            return false;
        }
        if (productMapper.findById(product.getId()) != null) {
            return false; // 编号已存在
        }
        return productMapper.insert(product) > 0;
    }

    public boolean updateProduct(Product product) {
        if (product.getId() == null) return false;
        return productMapper.update(product) > 0;
    }

    public boolean deleteProduct(String id) {
        return productMapper.deleteById(id) > 0;
    }

    public boolean stockIn(String id, int amount) {
        if (amount <= 0) return false;
        return productMapper.addQuantity(id, amount) > 0;
    }

    public boolean stockOut(String id, int amount) {
        if (amount <= 0) return false;
        return productMapper.reduceQuantity(id, amount) > 0;
    }

    /**
     * 获取统计信息
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("productCount", productMapper.countAll());
        stats.put("totalValue", productMapper.sumTotalValue());
        stats.put("categories", productMapper.findAllCategories());
        return stats;
    }

    public List<Product> getLowStockProducts(int threshold) {
        return productMapper.findLowStock(threshold);
    }
}
