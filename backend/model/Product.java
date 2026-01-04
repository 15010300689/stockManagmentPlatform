package model;

/**
 * 商品实体类
 * 表示库存系统中的商品信息
 */
public class Product {
    private String id;          // 商品ID
    private String name;        // 商品名称
    private double price;       // 商品价格
    private int quantity;       // 商品数量
    private String category;    // 商品类别

    // 构造函数
    public Product(String id, String name, double price, int quantity, String category) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.category = category;
    }

    // Getter和Setter方法
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    /**
     * 增加库存数量
     * @param amount 增加的数量
     */
    public void addQuantity(int amount) {
        if (amount > 0) {
            this.quantity += amount;
        }
    }

    /**
     * 减少库存数量
     * @param amount 减少的数量
     * @return 是否成功减少
     */
    public boolean reduceQuantity(int amount) {
        if (amount > 0 && this.quantity >= amount) {
            this.quantity -= amount;
            return true;
        }
        return false;
    }

    /**
     * 计算商品总价值
     * @return 总价值
     */
    public double getTotalValue() {
        return price * quantity;
    }

    @Override
    public String toString() {
        return String.format("商品ID: %s | 名称: %s | 价格: ¥%.2f | 数量: %d | 类别: %s | 总价值: ¥%.2f",
                id, name, price, quantity, category, getTotalValue());
    }
}

