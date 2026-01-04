package service;

import dao.ProductDao;
import model.Product;
import java.util.*;

/**
 * 商品业务逻辑层
 * 处理商品相关的业务逻辑
 */
public class ProductService {
    private ProductDao productDao;

    public ProductService(ProductDao productDao) {
        this.productDao = productDao;
    }

    /**
     * 添加新商品
     * @param product 商品对象
     * @return 是否添加成功
     */
    public boolean addProduct(Product product) {
        // 业务逻辑：验证商品信息
        if (product == null || product.getId() == null || product.getId().trim().isEmpty()) {
            return false;
        }
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            return false;
        }
        if (product.getPrice() < 0) {
            return false;
        }
        if (product.getQuantity() < 0) {
            return false;
        }
        return productDao.addProduct(product);
    }

    /**
     * 根据ID删除商品
     * @param id 商品ID
     * @return 是否删除成功
     */
    public boolean deleteProduct(String id) {
        return productDao.deleteProduct(id);
    }

    /**
     * 根据ID查找商品
     * @param id 商品ID
     * @return 商品对象，如果不存在则返回null
     */
    public Product findProductById(String id) {
        return productDao.findProductById(id);
    }

    /**
     * 根据名称查找商品（支持模糊搜索）
     * @param name 商品名称
     * @return 匹配的商品列表
     */
    public List<Product> findProductsByName(String name) {
        return productDao.findProductsByName(name);
    }

    /**
     * 根据类别查找商品
     * @param category 商品类别
     * @return 匹配的商品列表
     */
    public List<Product> findProductsByCategory(String category) {
        return productDao.findProductsByCategory(category);
    }

    /**
     * 获取所有商品列表
     * @return 所有商品的列表
     */
    public List<Product> getAllProducts() {
        return productDao.getAllProducts();
    }

    /**
     * 商品入库（增加库存）
     * @param id 商品ID
     * @param amount 入库数量
     * @return 是否成功
     */
    public boolean stockIn(String id, int amount) {
        if (amount <= 0) {
            return false;
        }
        Product product = productDao.findProductById(id);
        if (product != null) {
            product.addQuantity(amount);
            return true;
        }
        return false;
    }

    /**
     * 商品出库（减少库存）
     * @param id 商品ID
     * @param amount 出库数量
     * @return 是否成功
     */
    public boolean stockOut(String id, int amount) {
        if (amount <= 0) {
            return false;
        }
        Product product = productDao.findProductById(id);
        if (product != null) {
            return product.reduceQuantity(amount);
        }
        return false;
    }

    /**
     * 更新商品信息
     * @param id 商品ID
     * @param name 新名称（如果为null则不更新）
     * @param price 新价格（如果为负数则不更新）
     * @param category 新类别（如果为null则不更新）
     * @return 是否更新成功
     */
    public boolean updateProduct(String id, String name, double price, String category) {
        Product product = productDao.findProductById(id);
        if (product != null) {
            if (name != null && !name.trim().isEmpty()) {
                product.setName(name);
            }
            if (price >= 0) {
                product.setPrice(price);
            }
            if (category != null && !category.trim().isEmpty()) {
                product.setCategory(category);
            }
            return true;
        }
        return false;
    }

    /**
     * 获取库存总价值
     * @return 总价值
     */
    public double getTotalInventoryValue() {
        double total = 0;
        List<Product> products = productDao.getAllProducts();
        for (Product product : products) {
            total += product.getTotalValue();
        }
        return total;
    }

    /**
     * 获取商品总数
     * @return 商品种类数
     */
    public int getProductCount() {
        return productDao.getProductCount();
    }

    /**
     * 获取所有类别
     * @return 类别集合
     */
    public Set<String> getAllCategories() {
        return productDao.getAllCategories();
    }

    /**
     * 检查是否有库存不足的商品（数量小于阈值）
     * @param threshold 库存阈值
     * @return 库存不足的商品列表
     */
    public List<Product> getLowStockProducts(int threshold) {
        List<Product> result = new ArrayList<>();
        List<Product> products = productDao.getAllProducts();
        for (Product product : products) {
            if (product.getQuantity() < threshold) {
                result.add(product);
            }
        }
        return result;
    }
}

