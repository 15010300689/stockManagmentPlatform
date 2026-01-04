package controller;

import com.sun.net.httpserver.HttpExchange;
import service.ProductService;
import util.JsonUtil;
import model.Product;
import java.io.IOException;
import java.util.*;

/**
 * 商品控制器
 * 处理商品相关的HTTP请求
 */
public class ProductController {
    private ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * 处理商品列表相关请求 (GET, POST)
     */
    public void handleProducts(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        
        if ("OPTIONS".equals(method)) {
            handleOptions(exchange);
            return;
        }
        
        if ("GET".equals(method)) {
            // 查询参数处理
            String query = exchange.getRequestURI().getQuery();
            List<Product> products;
            
            if (query != null && query.contains("name=")) {
                String name = getQueryParam(query, "name");
                products = productService.findProductsByName(name);
            } else if (query != null && query.contains("category=")) {
                String category = getQueryParam(query, "category");
                products = productService.findProductsByCategory(category);
            } else {
                products = productService.getAllProducts();
            }
            
            sendJsonResponse(exchange, 200, JsonUtil.toJson(products));
        } else if ("POST".equals(method)) {
            // 添加商品
            String requestBody = readRequestBody(exchange);
            Product product = JsonUtil.fromJson(requestBody, Product.class);
            
            boolean success = productService.addProduct(product);
            if (success) {
                sendJsonResponse(exchange, 200, JsonUtil.success("商品添加成功"));
            } else {
                sendJsonResponse(exchange, 400, JsonUtil.error("商品ID已存在或信息不完整"));
            }
        } else {
            sendJsonResponse(exchange, 405, JsonUtil.error("不支持的请求方法"));
        }
    }

    /**
     * 处理单个商品相关请求 (GET, PUT, DELETE)
     */
    public void handleProduct(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        
        if ("OPTIONS".equals(method)) {
            handleOptions(exchange);
            return;
        }
        
        String query = exchange.getRequestURI().getQuery();
        String id = query != null ? getQueryParam(query, "id") : null;
        
        if (id == null) {
            sendJsonResponse(exchange, 400, JsonUtil.error("缺少商品ID参数"));
            return;
        }
        
        if ("GET".equals(method)) {
            Product product = productService.findProductById(id);
            if (product != null) {
                sendJsonResponse(exchange, 200, JsonUtil.toJson(product));
            } else {
                sendJsonResponse(exchange, 404, JsonUtil.error("商品不存在"));
            }
        } else if ("PUT".equals(method)) {
            String requestBody = readRequestBody(exchange);
            ProductUpdateRequest updateReq = JsonUtil.fromJson(requestBody, ProductUpdateRequest.class);
            
            boolean success = productService.updateProduct(
                id, updateReq.name, updateReq.price, updateReq.category
            );
            if (success) {
                sendJsonResponse(exchange, 200, JsonUtil.success("商品更新成功"));
            } else {
                sendJsonResponse(exchange, 404, JsonUtil.error("商品不存在"));
            }
        } else if ("DELETE".equals(method)) {
            boolean success = productService.deleteProduct(id);
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
    public void handleStatistics(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        
        if ("OPTIONS".equals(method)) {
            handleOptions(exchange);
            return;
        }
        
        if (!"GET".equals(method)) {
            sendJsonResponse(exchange, 405, JsonUtil.error("不支持的请求方法"));
            return;
        }
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("productCount", productService.getProductCount());
        stats.put("totalValue", productService.getTotalInventoryValue());
        stats.put("categories", new ArrayList<>(productService.getAllCategories()));
        
        sendJsonResponse(exchange, 200, JsonUtil.toJson(stats));
    }

    /**
     * 处理低库存查询请求
     */
    public void handleLowStock(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        
        if ("OPTIONS".equals(method)) {
            handleOptions(exchange);
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
        
        List<Product> products = productService.getLowStockProducts(threshold);
        sendJsonResponse(exchange, 200, JsonUtil.toJson(products));
    }

    /**
     * 处理入库请求
     */
    public void handleStockIn(HttpExchange exchange) throws IOException {
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
        StockOperation op = JsonUtil.fromJson(requestBody, StockOperation.class);
        
        boolean success = productService.stockIn(op.id, op.amount);
        if (success) {
            sendJsonResponse(exchange, 200, JsonUtil.success("入库成功"));
        } else {
            sendJsonResponse(exchange, 400, JsonUtil.error("入库失败"));
        }
    }

    /**
     * 处理出库请求
     */
    public void handleStockOut(HttpExchange exchange) throws IOException {
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
        StockOperation op = JsonUtil.fromJson(requestBody, StockOperation.class);
        
        boolean success = productService.stockOut(op.id, op.amount);
        if (success) {
            sendJsonResponse(exchange, 200, JsonUtil.success("出库成功"));
        } else {
            sendJsonResponse(exchange, 400, JsonUtil.error("出库失败，库存不足"));
        }
    }

    /**
     * 发送JSON响应
     */
    private void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        setCorsHeaders(exchange);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        
        byte[] response = json.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, response.length);
        try (java.io.OutputStream os = exchange.getResponseBody()) {
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
     * 读取请求体
     */
    private String readRequestBody(HttpExchange exchange) throws IOException {
        try (java.io.InputStream is = exchange.getRequestBody();
             java.io.BufferedReader reader = new java.io.BufferedReader(
                 new java.io.InputStreamReader(is, java.nio.charset.StandardCharsets.UTF_8))) {
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
                    return java.net.URLDecoder.decode(pair[1], java.nio.charset.StandardCharsets.UTF_8);
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
}

