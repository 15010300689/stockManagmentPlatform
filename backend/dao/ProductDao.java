package dao;

import model.Product;
import util.DbUtil;
import java.sql.*;
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
        if (DbUtil.isEnabled()) {
            return addProductToDb(product);
        }
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
        if (DbUtil.isEnabled()) {
            return deleteProductFromDb(id);
        }
        return products.remove(id) != null;
    }

    /**
     * 根据ID查找商品
     * @param id 商品ID
     * @return 商品对象，如果不存在则返回null
     */
    public Product findProductById(String id) {
        if (DbUtil.isEnabled()) {
            return findProductByIdFromDb(id);
        }
        return products.get(id);
    }

    /**
     * 根据名称查找商品（支持模糊搜索）
     * @param name 商品名称
     * @return 匹配的商品列表
     */
    public List<Product> findProductsByName(String name) {
        if (DbUtil.isEnabled()) {
            return findProductsByNameFromDb(name);
        }
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
        if (DbUtil.isEnabled()) {
            return findProductsByCategoryFromDb(category);
        }
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
        if (DbUtil.isEnabled()) {
            return getAllProductsFromDb();
        }
        return new ArrayList<>(products.values());
    }

    /**
     * 获取商品总数
     * @return 商品种类数
     */
    public int getProductCount() {
        if (DbUtil.isEnabled()) {
            return getProductCountFromDb();
        }
        return products.size();
    }

    /**
     * 获取所有类别
     * @return 类别集合
     */
    public Set<String> getAllCategories() {
        if (DbUtil.isEnabled()) {
            return getAllCategoriesFromDb();
        }
        Set<String> categories = new HashSet<>();
        for (Product product : products.values()) {
            categories.add(product.getCategory());
        }
        return categories;
    }

    private boolean addProductToDb(Product product) {
        String sql = "INSERT INTO product (id, name, price, quantity, category) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, product.getId());
            ps.setString(2, product.getName());
            ps.setBigDecimal(3, new java.math.BigDecimal(String.valueOf(product.getPrice())));
            ps.setInt(4, product.getQuantity());
            ps.setString(5, product.getCategory());
            ps.executeUpdate();
            return true;
        } catch (SQLException e) {
            // 主键冲突/连接失败等：兜底内存
            if (!products.containsKey(product.getId())) {
                products.put(product.getId(), product);
            }
            return false;
        }
    }

    private boolean deleteProductFromDb(String id) {
        String sql = "DELETE FROM product WHERE id = ?";
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            return products.remove(id) != null;
        }
    }

    private Product findProductByIdFromDb(String id) {
        String sql = "SELECT id, name, price, quantity, category FROM product WHERE id = ?";
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Product(
                            rs.getString("id"),
                            rs.getString("name"),
                            rs.getBigDecimal("price").doubleValue(),
                            rs.getInt("quantity"),
                            rs.getString("category")
                    );
                }
            }
        } catch (SQLException e) {
            return products.get(id);
        }
        return null;
    }

    private List<Product> getAllProductsFromDb() {
        List<Product> res = new ArrayList<>();
        String sql = "SELECT id, name, price, quantity, category FROM product";
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                res.add(new Product(
                        rs.getString("id"),
                        rs.getString("name"),
                        rs.getBigDecimal("price").doubleValue(),
                        rs.getInt("quantity"),
                        rs.getString("category")
                ));
            }
        } catch (SQLException e) {
            return new ArrayList<>(products.values());
        }
        return res;
    }

    private List<Product> findProductsByNameFromDb(String name) {
        List<Product> res = new ArrayList<>();
        String sql = "SELECT id, name, price, quantity, category FROM product WHERE name LIKE ?";
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, "%" + name + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    res.add(new Product(
                            rs.getString("id"),
                            rs.getString("name"),
                            rs.getBigDecimal("price").doubleValue(),
                            rs.getInt("quantity"),
                            rs.getString("category")
                    ));
                }
            }
        } catch (SQLException e) {
            return findProductsByName(name);
        }
        return res;
    }

    private List<Product> findProductsByCategoryFromDb(String category) {
        List<Product> res = new ArrayList<>();
        String sql = "SELECT id, name, price, quantity, category FROM product WHERE category = ?";
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, category);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    res.add(new Product(
                            rs.getString("id"),
                            rs.getString("name"),
                            rs.getBigDecimal("price").doubleValue(),
                            rs.getInt("quantity"),
                            rs.getString("category")
                    ));
                }
            }
        } catch (SQLException e) {
            return findProductsByCategory(category);
        }
        return res;
    }

    private int getProductCountFromDb() {
        String sql = "SELECT COUNT(*) AS c FROM product";
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt("c");
            }
        } catch (SQLException e) {
            return products.size();
        }
        return 0;
    }

    private Set<String> getAllCategoriesFromDb() {
        Set<String> res = new HashSet<>();
        String sql = "SELECT DISTINCT category FROM product WHERE category IS NOT NULL AND category <> ''";
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                res.add(rs.getString("category"));
            }
        } catch (SQLException e) {
            return getAllCategories();
        }
        return res;
    }
}

