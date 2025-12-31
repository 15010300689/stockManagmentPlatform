import java.util.*;

/**
 * 库存管理类
 * 提供商品的增删改查、入库、出库等功能
 */
public class InventoryManager {
    private Map<String, Product> products;  // 使用Map存储商品，key为商品ID

    public InventoryManager() {
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
     * 商品入库（增加库存）
     * @param id 商品ID
     * @param amount 入库数量
     * @return 是否成功
     */
    public boolean stockIn(String id, int amount) {
        Product product = products.get(id);
        if (product != null && amount > 0) {
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
        Product product = products.get(id);
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
        Product product = products.get(id);
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
        for (Product product : products.values()) {
            total += product.getTotalValue();
        }
        return total;
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

    /**
     * 检查是否有库存不足的商品（数量小于阈值）
     * @param threshold 库存阈值
     * @return 库存不足的商品列表
     */
    public List<Product> getLowStockProducts(int threshold) {
        List<Product> result = new ArrayList<>();
        for (Product product : products.values()) {
            if (product.getQuantity() < threshold) {
                result.add(product);
            }
        }
        return result;
    }
}

