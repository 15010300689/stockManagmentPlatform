package dao;

import model.Product;
import java.util.*;

/**
 * 商品数据访问层
 * 负责商品数据的增删改查操作
 */
public class ProductDao {
    private Map<String, Product> products;  // 使用Map存储商品，key为商品ID

    public ProductDao() {
        this.products = new HashMap<>();
    }

    /**
     * 添加新商品
     * @param product 商品对象
     * @return 是否添加成功
     */
    public boolean addProduct(Product product) {
        if (products.containsKey(product.getId())) {
            return false;  // 商品ID已存在
        }
        products.put(product.getId(), product);
        return true;
    }

    /**
     * 根据ID删除商品
     * @param id 商品ID
     * @return 是否删除成功
     */
    public boolean deleteProduct(String id) {
        return products.remove(id) != null;
    }

    /**
     * 根据ID查找商品
     * @param id 商品ID
     * @return 商品对象，如果不存在则返回null
     */
    public Product findProductById(String id) {
        return products.get(id);
    }

    /**
     * 根据名称查找商品（支持模糊搜索）
     * @param name 商品名称
     * @return 匹配的商品列表
     */
    public List<Product> findProductsByName(String name) {
        List<Product> result = new ArrayList<>();
        for (Product product : products.values()) {
            if (product.getName().contains(name)) {
                result.add(product);
            }
        }
        return result;
    }

    /**
     * 根据类别查找商品
     * @param category 商品类别
     * @return 匹配的商品列表
     */
    public List<Product> findProductsByCategory(String category) {
        List<Product> result = new ArrayList<>();
        for (Product product : products.values()) {
            if (product.getCategory().equals(category)) {
                result.add(product);
            }
        }
        return result;
    }

    /**
     * 获取所有商品列表
     * @return 所有商品的列表
     */
    public List<Product> getAllProducts() {
        return new ArrayList<>(products.values());
    }

    /**
     * 获取商品总数
     * @return 商品种类数
     */
    public int getProductCount() {
        return products.size();
    }

    /**
     * 获取所有类别
     * @return 类别集合
     */
    public Set<String> getAllCategories() {
        Set<String> categories = new HashSet<>();
        for (Product product : products.values()) {
            categories.add(product.getCategory());
        }
        return categories;
    }
}

