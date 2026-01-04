package util;

import model.Product;
import controller.ProductController;
import controller.AuthController;
import java.util.*;

/**
 * JSON工具类
 * 简单的JSON序列化和反序列化工具
 */
public class JsonUtil {
    
    /**
     * 将对象转换为JSON字符串
     */
    public static String toJson(Object obj) {
        if (obj == null) {
            return "null";
        }
        
        if (obj instanceof Product) {
            return productToJson((Product) obj);
        }
        
        if (obj instanceof List) {
            return listToJson((List<?>) obj);
        }
        
        if (obj instanceof Map) {
            return mapToJson((Map<?, ?>) obj);
        }
        
        if (obj instanceof String) {
            return "\"" + escapeJson((String) obj) + "\"";
        }
        
        if (obj instanceof Number || obj instanceof Boolean) {
            return obj.toString();
        }
        
        return "\"" + escapeJson(obj.toString()) + "\"";
    }
    
    /**
     * Product对象转JSON
     */
    private static String productToJson(Product product) {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"id\":").append(toJson(product.getId())).append(",");
        sb.append("\"name\":").append(toJson(product.getName())).append(",");
        sb.append("\"price\":").append(product.getPrice()).append(",");
        sb.append("\"quantity\":").append(product.getQuantity()).append(",");
        sb.append("\"category\":").append(toJson(product.getCategory())).append(",");
        sb.append("\"totalValue\":").append(product.getTotalValue());
        sb.append("}");
        return sb.toString();
    }
    
    /**
     * List转JSON
     */
    private static String listToJson(List<?> list) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(toJson(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }
    
    /**
     * Map转JSON
     */
    private static String mapToJson(Map<?, ?> map) {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        boolean first = true;
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            if (!first) sb.append(",");
            first = false;
            sb.append(toJson(entry.getKey().toString()));
            sb.append(":");
            sb.append(toJson(entry.getValue()));
        }
        sb.append("}");
        return sb.toString();
    }
    
    /**
     * 转义JSON字符串
     */
    private static String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
    
    /**
     * 从JSON字符串反序列化为对象
     */
    @SuppressWarnings("unchecked")
    public static <T> T fromJson(String json, Class<T> clazz) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        
        json = json.trim();
        
        if (clazz == Product.class) {
            return (T) parseProduct(json);
        }
        
        if (clazz == ProductController.ProductUpdateRequest.class) {
            return (T) parseProductUpdateRequest(json);
        }
        
        if (clazz == ProductController.StockOperation.class) {
            return (T) parseStockOperation(json);
        }
        
        if (clazz == AuthController.LoginRequest.class) {
            return (T) parseLoginRequest(json);
        }
        
        return null;
    }
    
    /**
     * 解析Product对象
     */
    private static Product parseProduct(String json) {
        Map<String, String> map = parseJsonObject(json);
        String id = map.get("id");
        String name = map.get("name");
        double price = Double.parseDouble(map.getOrDefault("price", "0"));
        int quantity = Integer.parseInt(map.getOrDefault("quantity", "0"));
        String category = map.get("category");
        
        return new Product(id, name, price, quantity, category);
    }
    
    /**
     * 解析ProductUpdateRequest对象
     */
    private static ProductController.ProductUpdateRequest parseProductUpdateRequest(String json) {
        Map<String, String> map = parseJsonObject(json);
        ProductController.ProductUpdateRequest req = new ProductController.ProductUpdateRequest();
        req.name = map.get("name");
        if (map.containsKey("price")) {
            req.price = Double.parseDouble(map.get("price"));
        }
        req.category = map.get("category");
        return req;
    }
    
    /**
     * 解析StockOperation对象
     */
    private static ProductController.StockOperation parseStockOperation(String json) {
        Map<String, String> map = parseJsonObject(json);
        ProductController.StockOperation op = new ProductController.StockOperation();
        op.id = map.get("id");
        op.amount = Integer.parseInt(map.getOrDefault("amount", "0"));
        return op;
    }
    
    /**
     * 解析LoginRequest对象
     */
    private static AuthController.LoginRequest parseLoginRequest(String json) {
        Map<String, String> map = parseJsonObject(json);
        AuthController.LoginRequest req = new AuthController.LoginRequest();
        req.username = map.get("username");
        req.password = map.get("password");
        return req;
    }
    
    /**
     * 解析JSON对象为Map
     */
    private static Map<String, String> parseJsonObject(String json) {
        Map<String, String> map = new HashMap<>();
        json = json.trim();
        
        if (json.startsWith("{") && json.endsWith("}")) {
            json = json.substring(1, json.length() - 1);
        }
        
        String[] pairs = json.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":", 2);
            if (keyValue.length == 2) {
                String key = unquote(keyValue[0].trim());
                String value = unquote(keyValue[1].trim());
                map.put(key, value);
            }
        }
        
        return map;
    }
    
    /**
     * 移除JSON字符串的引号
     */
    private static String unquote(String str) {
        str = str.trim();
        if (str.startsWith("\"") && str.endsWith("\"")) {
            str = str.substring(1, str.length() - 1);
        }
        return str.replace("\\\"", "\"")
                  .replace("\\n", "\n")
                  .replace("\\r", "\r")
                  .replace("\\t", "\t")
                  .replace("\\\\", "\\");
    }
    
    /**
     * 创建成功响应JSON
     */
    public static String success(String message) {
        return "{\"success\":true,\"message\":\"" + escapeJson(message) + "\"}";
    }
    
    /**
     * 创建错误响应JSON
     */
    public static String error(String message) {
        return "{\"success\":false,\"message\":\"" + escapeJson(message) + "\"}";
    }
}

