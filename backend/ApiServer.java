import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.Executors;

/**
 * REST API服务器
 * 提供HTTP接口供前端调用
 */
public class ApiServer {
    private HttpServer server;
    private InventoryManager inventoryManager;
    private AuthManager authManager;
    private static final int PORT = 8080;

    public ApiServer(InventoryManager inventoryManager, AuthManager authManager) {
        this.inventoryManager = inventoryManager;
        this.authManager = authManager;
    }

    /**
     * 启动服务器
     */
    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(PORT), 0);
        
        // 认证API路由（不需要token验证）
        server.createContext("/api/login", this::handleLogin);
        server.createContext("/api/logout", this::handleLogout);
        server.createContext("/api/verify", this::handleVerify);
        
        // 业务API路由（需要token验证）
        server.createContext("/api/products", this::handleProducts);
        server.createContext("/api/product", this::handleProduct);
        server.createContext("/api/statistics", this::handleStatistics);
        server.createContext("/api/low-stock", this::handleLowStock);
        server.createContext("/api/stock-in", this::handleStockIn);
        server.createContext("/api/stock-out", this::handleStockOut);
        
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
     * 处理登录请求
     */
    private void handleLogin(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        
        if ("OPTIONS".equals(method)) {
            handleOptions(exchange);
            return;
        }
        
        if (!"POST".equals(method)) {
            sendJsonResponse(exchange, 405, JsonUtil.error("不支持的请求方法"));
            return;
        }
        
        String requestBody = readRequestBody(exchange);
        LoginRequest loginReq = JsonUtil.fromJson(requestBody, LoginRequest.class);
        
        if (loginReq == null || loginReq.username == null || loginReq.password == null) {
            sendJsonResponse(exchange, 400, JsonUtil.error("用户名和密码不能为空"));
            return;
        }
        
        String token = authManager.login(loginReq.username, loginReq.password);
        if (token != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            response.put("username", loginReq.username);
            sendJsonResponse(exchange, 200, JsonUtil.toJson(response));
        } else {
            sendJsonResponse(exchange, 401, JsonUtil.error("用户名或密码错误"));
        }
    }

    /**
     * 处理登出请求
     */
    private void handleLogout(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        
        if ("OPTIONS".equals(method)) {
            handleOptions(exchange);
            return;
        }
        
        if (!"POST".equals(method)) {
            sendJsonResponse(exchange, 405, JsonUtil.error("不支持的请求方法"));
            return;
        }
        
        String token = getTokenFromHeader(exchange);
        if (token != null) {
            authManager.logout(token);
        }
        sendJsonResponse(exchange, 200, JsonUtil.success("登出成功"));
    }

    /**
     * 处理token验证请求
     */
    private void handleVerify(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        
        if ("OPTIONS".equals(method)) {
            handleOptions(exchange);
            return;
        }
        
        if (!"GET".equals(method)) {
            sendJsonResponse(exchange, 405, JsonUtil.error("不支持的请求方法"));
            return;
        }
        
        String token = getTokenFromHeader(exchange);
        String username = token != null ? authManager.validateToken(token) : null;
        
        if (username != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("username", username);
            sendJsonResponse(exchange, 200, JsonUtil.toJson(response));
        } else {
            sendJsonResponse(exchange, 401, JsonUtil.error("Token无效或已过期"));
        }
    }

    /**
     * 从请求头获取token
     */
    private String getTokenFromHeader(HttpExchange exchange) {
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        // 兼容从查询参数获取token（用于测试）
        String query = exchange.getRequestURI().getQuery();
        if (query != null) {
            return getQueryParam(query, "token");
        }
        return null;
    }

    /**
     * 验证token，如果无效返回401
     */
    private boolean validateToken(HttpExchange exchange) throws IOException {
        String token = getTokenFromHeader(exchange);
        String username = token != null ? authManager.validateToken(token) : null;
        if (username == null) {
            sendJsonResponse(exchange, 401, JsonUtil.error("未登录或登录已过期，请重新登录"));
            return false;
        }
        return true;
    }

    /**
     * 处理商品列表相关请求 (GET, POST)
     */
    private void handleProducts(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        
        if ("OPTIONS".equals(method)) {
            handleOptions(exchange);
            return;
        }
        
        // 验证token
        if (!validateToken(exchange)) {
            return;
        }
        
        if ("GET".equals(method)) {
            // 查询参数处理
            String query = exchange.getRequestURI().getQuery();
            List<Product> products;
            
            if (query != null && query.contains("name=")) {
                String name = getQueryParam(query, "name");
                products = inventoryManager.findProductsByName(name);
            } else if (query != null && query.contains("category=")) {
                String category = getQueryParam(query, "category");
                products = inventoryManager.findProductsByCategory(category);
            } else {
                products = inventoryManager.getAllProducts();
            }
            
            sendJsonResponse(exchange, 200, JsonUtil.toJson(products));
        } else if ("POST".equals(method)) {
            // 添加商品
            String requestBody = readRequestBody(exchange);
            Product product = JsonUtil.fromJson(requestBody, Product.class);
            
            boolean success = inventoryManager.addProduct(product);
            if (success) {
                sendJsonResponse(exchange, 200, JsonUtil.success("商品添加成功"));
            } else {
                sendJsonResponse(exchange, 400, JsonUtil.error("商品ID已存在"));
            }
        } else {
            sendJsonResponse(exchange, 405, JsonUtil.error("不支持的请求方法"));
        }
    }

    /**
     * 处理单个商品相关请求 (GET, PUT, DELETE)
     */
    private void handleProduct(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        
        if ("OPTIONS".equals(method)) {
            handleOptions(exchange);
            return;
        }
        
        // 验证token
        if (!validateToken(exchange)) {
            return;
        }
        
        String query = exchange.getRequestURI().getQuery();
        String id = query != null ? getQueryParam(query, "id") : null;
        
        if (id == null) {
            sendJsonResponse(exchange, 400, JsonUtil.error("缺少商品ID参数"));
            return;
        }
        
        if ("GET".equals(method)) {
            Product product = inventoryManager.findProductById(id);
            if (product != null) {
                sendJsonResponse(exchange, 200, JsonUtil.toJson(product));
            } else {
                sendJsonResponse(exchange, 404, JsonUtil.error("商品不存在"));
            }
        } else if ("PUT".equals(method)) {
            String requestBody = readRequestBody(exchange);
            ProductUpdateRequest updateReq = JsonUtil.fromJson(requestBody, ProductUpdateRequest.class);
            
            boolean success = inventoryManager.updateProduct(
                id, updateReq.name, updateReq.price, updateReq.category
            );
            if (success) {
                sendJsonResponse(exchange, 200, JsonUtil.success("商品更新成功"));
            } else {
                sendJsonResponse(exchange, 404, JsonUtil.error("商品不存在"));
            }
        } else if ("DELETE".equals(method)) {
            boolean success = inventoryManager.deleteProduct(id);
            if (success) {
                sendJsonResponse(exchange, 200, JsonUtil.success("商品删除成功"));
            } else {
                sendJsonResponse(exchange, 404, JsonUtil.error("商品不存在"));
            }
        } else {
            sendJsonResponse(exchange, 405, JsonUtil.error("不支持的请求方法"));
        }
    }

    /**
     * 处理库存统计请求
     */
    private void handleStatistics(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        
        if ("OPTIONS".equals(method)) {
            handleOptions(exchange);
            return;
        }
        
        // 验证token
        if (!validateToken(exchange)) {
            return;
        }
        
        if (!"GET".equals(method)) {
            sendJsonResponse(exchange, 405, JsonUtil.error("不支持的请求方法"));
            return;
        }
        
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("productCount", inventoryManager.getProductCount());
        stats.put("totalValue", inventoryManager.getTotalInventoryValue());
        stats.put("categories", new java.util.ArrayList<>(inventoryManager.getAllCategories()));
        
        sendJsonResponse(exchange, 200, JsonUtil.toJson(stats));
    }

    /**
     * 处理低库存查询请求
     */
    private void handleLowStock(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        
        if ("OPTIONS".equals(method)) {
            handleOptions(exchange);
            return;
        }
        
        // 验证token
        if (!validateToken(exchange)) {
            return;
        }
        
        if (!"GET".equals(method)) {
            sendJsonResponse(exchange, 405, JsonUtil.error("不支持的请求方法"));
            return;
        }
        
        String query = exchange.getRequestURI().getQuery();
        int threshold = 10; // 默认阈值
        if (query != null && query.contains("threshold=")) {
            try {
                threshold = Integer.parseInt(getQueryParam(query, "threshold"));
            } catch (NumberFormatException e) {
                // 使用默认值
            }
        }
        
        List<Product> products = inventoryManager.getLowStockProducts(threshold);
        sendJsonResponse(exchange, 200, JsonUtil.toJson(products));
    }

    /**
     * 处理入库请求
     */
    private void handleStockIn(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        
        if ("OPTIONS".equals(method)) {
            handleOptions(exchange);
            return;
        }
        
        // 验证token
        if (!validateToken(exchange)) {
            return;
        }
        
        if (!"POST".equals(method)) {
            sendJsonResponse(exchange, 405, JsonUtil.error("不支持的请求方法"));
            return;
        }
        
        String requestBody = readRequestBody(exchange);
        StockOperation op = JsonUtil.fromJson(requestBody, StockOperation.class);
        
        boolean success = inventoryManager.stockIn(op.id, op.amount);
        if (success) {
            sendJsonResponse(exchange, 200, JsonUtil.success("入库成功"));
        } else {
            sendJsonResponse(exchange, 400, JsonUtil.error("入库失败"));
        }
    }

    /**
     * 处理出库请求
     */
    private void handleStockOut(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        
        if ("OPTIONS".equals(method)) {
            handleOptions(exchange);
            return;
        }
        
        // 验证token
        if (!validateToken(exchange)) {
            return;
        }
        
        if (!"POST".equals(method)) {
            sendJsonResponse(exchange, 405, JsonUtil.error("不支持的请求方法"));
            return;
        }
        
        String requestBody = readRequestBody(exchange);
        StockOperation op = JsonUtil.fromJson(requestBody, StockOperation.class);
        
        boolean success = inventoryManager.stockOut(op.id, op.amount);
        if (success) {
            sendJsonResponse(exchange, 200, JsonUtil.success("出库成功"));
        } else {
            sendJsonResponse(exchange, 400, JsonUtil.error("出库失败，库存不足"));
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
     * 发送JSON响应
     */
    private void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        setCorsHeaders(exchange);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        
        byte[] response = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, response.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response);
        }
    }

    /**
     * 设置CORS响应头
     */
    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    /**
     * 处理OPTIONS预检请求
     */
    private void handleOptions(HttpExchange exchange) throws IOException {
        setCorsHeaders(exchange);
        exchange.sendResponseHeaders(200, -1);
    }

    /**
     * 发送错误响应
     */
    private void sendErrorResponse(HttpExchange exchange, int statusCode, String message) throws IOException {
        exchange.sendResponseHeaders(statusCode, message.length());
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(message.getBytes(StandardCharsets.UTF_8));
        }
    }

    /**
     * 读取请求体
     */
    private String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }

    /**
     * 从查询字符串获取参数值
     */
    private String getQueryParam(String query, String paramName) {
        String[] params = query.split("&");
        for (String param : params) {
            String[] pair = param.split("=");
            if (pair.length == 2 && paramName.equals(pair[0])) {
                try {
                    return java.net.URLDecoder.decode(pair[1], StandardCharsets.UTF_8);
                } catch (Exception e) {
                    return pair[1];
                }
            }
        }
        return null;
    }

    // 内部类用于JSON反序列化
    static class ProductUpdateRequest {
        public String name;
        public double price = -1;
        public String category;
    }

    static class StockOperation {
        public String id;
        public int amount;
    }

    static class LoginRequest {
        public String username;
        public String password;
    }
}

