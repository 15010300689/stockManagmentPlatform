package com.stock.dto;

/**
 * 商品入/出库请求（统一走分仓库存）
 */
public class StockRequest {
    private Long id;
    private Integer warehouseId;
    private Integer positionId;
    private Integer amount;
    private String remark;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Integer warehouseId) { this.warehouseId = warehouseId; }
    public Integer getPositionId() { return positionId; }
    public void setPositionId(Integer positionId) { this.positionId = positionId; }
    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
}
