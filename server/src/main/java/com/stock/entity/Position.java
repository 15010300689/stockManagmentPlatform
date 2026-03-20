package com.stock.entity;

public class Position {
    private Integer id;
    private Integer warehouseId;
    private Integer parentId;
    private String code;
    private String name;
    private String type;
    private String status;
    private Integer maxCapacity;
    private String unit;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Integer warehouseId) { this.warehouseId = warehouseId; }
    public Integer getParentId() { return parentId; }
    public void setParentId(Integer parentId) { this.parentId = parentId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
}
