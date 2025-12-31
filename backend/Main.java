import java.io.IOException;

/**
 * 库存管理系统主程序
 * 启动REST API服务器
 */
public class Main {
    private static InventoryManager inventoryManager;
    private static AuthManager authManager;
    private static ApiServer apiServer;

    public static void main(String[] args) {
        inventoryManager = new InventoryManager();
        authManager = new AuthManager();
        
        // 初始化一些示例数据
        initSampleData();
        
        // 创建并启动API服务器
        apiServer = new ApiServer(inventoryManager, authManager);
        try {
            apiServer.start();
            System.out.println("\n=========================================");
            System.out.println("     库存管理系统已启动");
            System.out.println("=========================================");
            System.out.println("访问地址: http://localhost:8080");
            System.out.println("按 Ctrl+C 停止服务器");
            System.out.println("=========================================\n");
            
            // 保持程序运行
            Thread.currentThread().join();
        } catch (IOException e) {
            System.err.println("启动服务器失败: " + e.getMessage());
            e.printStackTrace();
        } catch (InterruptedException e) {
            System.out.println("\n服务器正在关闭...");
            apiServer.stop();
        }
    }

    /**
     * 初始化示例数据
     */
    private static void initSampleData() {
        inventoryManager.addProduct(new Product("P001", "笔记本电脑", 5999.00, 50, "电子产品"));
        inventoryManager.addProduct(new Product("P002", "无线鼠标", 99.00, 200, "电子产品"));
        inventoryManager.addProduct(new Product("P003", "办公椅", 399.00, 30, "家具"));
        inventoryManager.addProduct(new Product("P004", "A4打印纸", 25.00, 500, "办公用品"));
    }
}
