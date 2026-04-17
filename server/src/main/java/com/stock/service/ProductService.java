package com.stock.service;

import com.stock.entity.Product;
import com.stock.mapper.InventoryMapper;
import com.stock.mapper.ProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ProductService {

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private InventoryMapper inventoryMapper;

    public List<Product> getAllProducts() {
        return productMapper.findAll();
    }

    public List<Product> findByName(String name) {
        return productMapper.findByName(name);
    }

    public List<Product> findByCategory(String category) {
        return productMapper.findByCategory(category);
    }

    public Product findById(Long id) {
        if (id == null) {
            return null;
        }
        return productMapper.findById(id);
    }

    /**
     * 新增商品：id 由数据库生成；名称全局唯一（去首尾空格后比较）
     */
    @Transactional(rollbackFor = Exception.class)
    public Product addProduct(Product product) {
        if (product == null) {
            throw new IllegalArgumentException("参数无效");
        }
        product.setId(null);
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("商品名称不能为空");
        }
        String name = product.getName().trim();
        product.setName(name);
        if (product.getPrice() == null) {
            throw new IllegalArgumentException("价格不能为空");
        }
        if (productMapper.findByExactName(name) != null) {
            throw new IllegalArgumentException("商品名称已存在，请勿重复添加");
        }
        product.setQuantity(0);
        if (product.getStatus() == null) {
            product.setStatus(1);
        }
        if (productMapper.insert(product) <= 0) {
            throw new IllegalStateException("新增商品失败");
        }
        return product;
    }

    /**
     * 更新主数据：不允许直接改库存数量字段；名称不可与其他商品重复
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean updateProduct(Product product) {
        if (product.getId() == null) {
            return false;
        }
        if (product.getName() != null) {
            String name = product.getName().trim();
            if (name.isEmpty()) {
                throw new IllegalArgumentException("商品名称不能为空");
            }
            if (productMapper.countByNameExceptId(name, product.getId()) > 0) {
                throw new IllegalArgumentException("商品名称已存在，请更换名称");
            }
            product.setName(name);
        }
        product.setQuantity(null);
        return productMapper.update(product) > 0;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean deleteProduct(Long id) {
        if (id == null) {
            return false;
        }
        if (productMapper.findById(id) == null) {
            return false;
        }
        inventoryMapper.deleteLogsByProductId(id);
        inventoryMapper.deleteInventoryByProductId(id);
        return productMapper.deleteById(id) > 0;
    }

    public boolean stockIn(Long id, int amount) {
        if (id == null || amount <= 0) {
            return false;
        }
        return productMapper.addQuantity(id, amount) > 0;
    }

    public boolean stockOut(Long id, int amount) {
        if (id == null || amount <= 0) {
            return false;
        }
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
