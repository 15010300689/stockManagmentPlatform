package model;

public class Position {
    private Integer id;
    private Integer warehouseId;
    private Integer parentId; // null for root
    private String code;
    private String name;
    private String type;   // area/shelf/level/position
    private String status; // 1/0
    private int maxCapacity;
    private String unit;

    public Position(Integer id, Integer warehouseId, Integer parentId, String code, String name, String type, String status, int maxCapacity, String unit) {
        this.id = id;
        this.warehouseId = warehouseId;
        this.parentId = parentId;
        this.code = code;
        this.name = name;
        this.type = type;
        this.status = status;
        this.maxCapacity = maxCapacity;
        this.unit = unit;
    }

    public Integer getId() { return id; }
    public Integer getWarehouseId() { return warehouseId; }
    public Integer getParentId() { return parentId; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getType() { return type; }
    public String getStatus() { return status; }
    public int getMaxCapacity() { return maxCapacity; }
    public String getUnit() { return unit; }
}
