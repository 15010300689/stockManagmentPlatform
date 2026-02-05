package model;

public class Warehouse {
    private Integer id;
    private String code;
    private String name;
    private String status; // 1 启用, 0 停用
    private String address;
    private String contact;
    private String phone;

    public Warehouse(Integer id, String code, String name, String status, String address, String contact, String phone) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.status = status;
        this.address = address;
        this.contact = contact;
        this.phone = phone;
    }

    public Integer getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getStatus() { return status; }
    public String getAddress() { return address; }
    public String getContact() { return contact; }
    public String getPhone() { return phone; }
}
