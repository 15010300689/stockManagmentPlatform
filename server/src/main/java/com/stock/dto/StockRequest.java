package com.stock.dto;

public class StockRequest {
    private Long id;
    private Integer amount;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }
}
