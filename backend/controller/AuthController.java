package controller;

import com.sun.net.httpserver.HttpExchange;
import service.AuthService;
import util.JsonUtil;
import java.io.IOException;
import java.util.*;

/**
 * 认证控制器
 * 处理认证相关的HTTP请求
 */
public class AuthController {
    private AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 处理登录请求
     */
    public void handleLogin(HttpExchange exchange) throws IOException {
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
        
        String token = authService.login(loginReq.username, loginReq.password);
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
    public void handleLogout(HttpExchange exchange) throws IOException {
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
            authService.logout(token);
        }
        sendJsonResponse(exchange, 200, JsonUtil.success("登出成功"));
    }

    /**
     * 处理token验证请求
     */
    public void handleVerify(HttpExchange exchange) throws IOException {
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
        String username = token != null ? authService.validateToken(token) : null;
        
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
    public boolean validateToken(HttpExchange exchange) throws IOException {
        String token = getTokenFromHeader(exchange);
        String username = token != null ? authService.validateToken(token) : null;
        if (username == null) {
            sendJsonResponse(exchange, 401, JsonUtil.error("未登录或登录已过期，请重新登录"));
            return false;
        }
        return true;
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
    static class LoginRequest {
        public String username;
        public String password;
    }
}

