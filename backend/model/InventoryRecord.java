package model;

public class InventoryRecord {
    private String productId;
    private Integer warehouseId;
    private Integer positionId; // 可为null表示仓库级
    private int quantity;

    public InventoryRecord(String productId, Integer warehouseId, Integer positionId, int quantity) {
        this.productId = productId;
        this.warehouseId = warehouseId;
        this.positionId = positionId;
        this.quantity = quantity;
    }

    public String getProductId() { return productId; }
    public Integer getWarehouseId() { return warehouseId; }
    public Integer getPositionId() { return positionId; }
    public int getQuantity() { return quantity; }

    public void addQuantity(int amount) {
        if (amount > 0) {
            this.quantity += amount;
        }
    }

    public boolean reduceQuantity(int amount) {
        if (amount > 0 && this.quantity >= amount) {
            this.quantity -= amount;
            return true;
        }
        return false;
    }
}
