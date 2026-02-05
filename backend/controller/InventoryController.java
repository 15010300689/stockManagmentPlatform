package controller;

import com.sun.net.httpserver.HttpExchange;
import service.InventoryService;
import util.JsonUtil;

import java.io.IOException;

public class InventoryController {
    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    public void handleStores(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        if ("OPTIONS".equals(method)) {
            handleOptions(exchange);
            return;
        }
        if (!"GET".equals(method)) {
            sendJsonResponse(exchange, 405, JsonUtil.error("不支持的请求方法"));
            return;
        }
        sendJsonResponse(exchange, 200, JsonUtil.toJson(inventoryService.getStores()));
    }

    public void handlePositions(HttpExchange exchange) throws IOException {
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
        Integer warehouseId = null;
        if (query != null && query.contains("warehouseId=")) {
            try {
                warehouseId = Integer.parseInt(getQueryParam(query, "warehouseId"));
            } catch (Exception ignored) {}
        }
        sendJsonResponse(exchange, 200, JsonUtil.toJson(inventoryService.getPositions(warehouseId)));
    }

    public void handleInventorySummary(HttpExchange exchange) throws IOException {
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
        String productId = query != null ? getQueryParam(query, "productId") : null;
        if (productId == null) {
            sendJsonResponse(exchange, 400, JsonUtil.error("缺少productId"));
            return;
        }
        sendJsonResponse(exchange, 200, JsonUtil.toJson(inventoryService.getWarehouseSummary(productId)));
    }

    public void handleInventoryPositions(HttpExchange exchange) throws IOException {
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
        String productId = query != null ? getQueryParam(query, "productId") : null;
        Integer warehouseId = null;
        if (query != null && query.contains("warehouseId=")) {
            try {
                warehouseId = Integer.parseInt(getQueryParam(query, "warehouseId"));
            } catch (Exception ignored) {}
        }
        if (productId == null) {
            sendJsonResponse(exchange, 400, JsonUtil.error("缺少productId"));
            return;
        }
        sendJsonResponse(exchange, 200, JsonUtil.toJson(inventoryService.getPositionSummary(productId, warehouseId)));
    }

    public void handleInventoryAdjust(HttpExchange exchange) throws IOException {
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
        AdjustRequest req = JsonUtil.fromJson(requestBody, AdjustRequest.class);
        if (req == null || req.productId == null || req.warehouseId == null || req.amount <= 0 || req.type == null) {
            sendJsonResponse(exchange, 400, JsonUtil.error("参数不完整"));
            return;
        }
        boolean success = inventoryService.adjustInventory(req.productId, req.warehouseId, req.positionId, req.amount, req.type);
        if (success) {
            sendJsonResponse(exchange, 200, JsonUtil.success("操作成功"));
        } else {
            sendJsonResponse(exchange, 400, JsonUtil.error("操作失败，库存不足或商品不存在"));
        }
    }

    private void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        setCorsHeaders(exchange);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        byte[] response = json.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, response.length);
        try (java.io.OutputStream os = exchange.getResponseBody()) {
            os.write(response);
        }
    }

    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private void handleOptions(HttpExchange exchange) throws IOException {
        setCorsHeaders(exchange);
        exchange.sendResponseHeaders(200, -1);
    }

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

    private String getQueryParam(String query, String paramName) {
        String[] params = query.split("&");
        for (String param : params) {
            String[] pair = param.split("=");
            if (pair.length == 2 && paramName.equals(pair[0])) {
                try {
                    return java.net.URLDecoder.decode(pair[1], "UTF-8");
                } catch (Exception e) {
                    return pair[1];
                }
            }
        }
        return null;
    }

    public static class AdjustRequest {
        public String productId;
        public Integer warehouseId;
        public Integer positionId;
        public int amount;
        public String type; // in / out
        public String remark;
    }
}
