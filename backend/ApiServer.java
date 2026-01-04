import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import controller.ProductController;
import controller.AuthController;
import java.io.*;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

/**
 * REST API服务器
 * 负责HTTP服务器配置和路由分发
 */
public class ApiServer {
    private HttpServer server;
    private ProductController productController;
    private AuthController authController;
    private static final int PORT = 8080;

    public ApiServer(ProductController productController, AuthController authController) {
        this.productController = productController;
        this.authController = authController;
    }

    /**
     * 启动服务器
     */
    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(PORT), 0);
        
        // 认证API路由（不需要token验证）
        server.createContext("/api/login", exchange -> {
            try {
                authController.handleLogin(exchange);
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        server.createContext("/api/logout", exchange -> {
            try {
                authController.handleLogout(exchange);
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        server.createContext("/api/verify", exchange -> {
            try {
                authController.handleVerify(exchange);
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        
        // 业务API路由（需要token验证）
        server.createContext("/api/products", exchange -> {
            try {
                if (authController.validateToken(exchange)) {
                    productController.handleProducts(exchange);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        server.createContext("/api/product", exchange -> {
            try {
                if (authController.validateToken(exchange)) {
                    productController.handleProduct(exchange);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        server.createContext("/api/statistics", exchange -> {
            try {
                if (authController.validateToken(exchange)) {
                    productController.handleStatistics(exchange);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        server.createContext("/api/low-stock", exchange -> {
            try {
                if (authController.validateToken(exchange)) {
                    productController.handleLowStock(exchange);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        server.createContext("/api/stock-in", exchange -> {
            try {
                if (authController.validateToken(exchange)) {
                    productController.handleStockIn(exchange);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        server.createContext("/api/stock-out", exchange -> {
            try {
                if (authController.validateToken(exchange)) {
                    productController.handleStockOut(exchange);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        
        // 静态文件服务
        server.createContext("/", this::handleStaticFiles);
        
        server.setExecutor(Executors.newFixedThreadPool(10));
        server.start();
        System.out.println("服务器已启动，访问地址: http://localhost:" + PORT);
    }

    /**
     * 停止服务器
     */
    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    /**
     * 处理静态文件请求
     */
    private void handleStaticFiles(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        
        // 默认返回index.html
        if ("/".equals(path)) {
            path = "/index.html";
        }
        
        // 移除开头的斜杠
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        
        // 防止路径遍历攻击
        if (path.contains("..")) {
            sendErrorResponse(exchange, 403, "禁止访问");
            return;
        }
        
        // 如果没有扩展名，尝试添加.html
        if (!path.contains(".")) {
            path = path + ".html";
        }
        
        File file = new File("web" + File.separator + path);
        
        if (!file.exists() || !file.isFile()) {
            sendErrorResponse(exchange, 404, "文件未找到");
            return;
        }
        
        // 设置Content-Type
        String contentType = getContentType(path);
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(200, file.length());
        
        try (FileInputStream fis = new FileInputStream(file);
             OutputStream os = exchange.getResponseBody()) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                os.write(buffer, 0, bytesRead);
            }
        }
    }

    /**
     * 获取Content-Type
     */
    private String getContentType(String path) {
        if (path.endsWith(".html")) return "text/html; charset=utf-8";
        if (path.endsWith(".js")) return "application/javascript; charset=utf-8";
        if (path.endsWith(".css")) return "text/css; charset=utf-8";
        if (path.endsWith(".json")) return "application/json; charset=utf-8";
        return "application/octet-stream";
    }

    /**
     * 发送错误响应
     */
    private void sendErrorResponse(HttpExchange exchange, int statusCode, String message) throws IOException {
        exchange.sendResponseHeaders(statusCode, message.length());
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(message.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }
}
