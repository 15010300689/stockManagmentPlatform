package com.stock.entity;

import java.math.BigDecimal;

public class Product {
    /** 数据库自增主键 */
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer quantity;
    private String category;
    private Integer safeStock;
    private Integer status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Integer getSafeStock() { return safeStock; }
    public void setSafeStock(Integer safeStock) { this.safeStock = safeStock; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
}
