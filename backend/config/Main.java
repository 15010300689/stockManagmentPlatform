package config;

import dao.ProductDao;
import dao.UserDao;
import service.ProductService;
import service.AuthService;
import controller.ProductController;
import controller.AuthController;
import model.Product;
import ApiServer;
import java.io.IOException;

/**
 * 库存管理系统主程序
 * 启动REST API服务器
 */
public class Main {
    private static ProductDao productDao;
    private static UserDao userDao;
    private static ProductService productService;
    private static AuthService authService;
    private static ProductController productController;
    private static AuthController authController;
    private static ApiServer apiServer;

    public static void main(String[] args) {
        // 初始化DAO层
        productDao = new ProductDao();
        userDao = new UserDao();
        
        // 初始化Service层
        productService = new ProductService(productDao);
        authService = new AuthService(userDao);
        
        // 初始化Controller层
        productController = new ProductController(productService);
        authController = new AuthController(authService);
        
        // 初始化一些示例数据
        initSampleData();
        
        // 创建并启动API服务器
        apiServer = new ApiServer(productController, authController);
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
        productService.addProduct(new Product("P001", "笔记本电脑", 5999.00, 50, "电子产品"));
        productService.addProduct(new Product("P002", "无线鼠标", 99.00, 200, "电子产品"));
        productService.addProduct(new Product("P003", "办公椅", 399.00, 30, "家具"));
        productService.addProduct(new Product("P004", "A4打印纸", 25.00, 500, "办公用品"));
    }
}

