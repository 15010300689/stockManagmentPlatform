package com.stock.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.dto.Result;
import com.stock.mapper.PermissionMapper;
import com.stock.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * JWT 拦截器：对受保护接口进行 Token 验证
 */
@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private PermissionMapper permissionMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 放行 OPTIONS 预检请求
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.validateToken(token)) {
                // 将用户信息写入 request 属性，供 Controller 使用
                Long userId = jwtUtil.getUserId(token);
                request.setAttribute("userId", userId);
                request.setAttribute("username", jwtUtil.getUsername(token));

                // 接口权限校验：按 method + path 动态匹配权限码
                String method = request.getMethod();
                String path = request.getRequestURI();
                String requiredPermission = permissionMapper.findPermissionCodeByApi(method, path);

                // 未配置权限码的接口默认放行（兼容旧接口）
                if (requiredPermission == null || requiredPermission.trim().isEmpty()) {
                    return true;
                }

                List<String> userPermissions = permissionMapper.findUserPermissionCodes(userId);
                if (userPermissions != null && userPermissions.contains(requiredPermission)) {
                    return true;
                }
                sendForbidden(response, "无权限访问该接口: " + requiredPermission);
                return false;
            }
        }

        sendUnauthorized(response, "未登录或登录已过期，请重新登录");
        return false;
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(Result.error(message)));
    }

    private void sendForbidden(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(Result.error(message)));
    }
}
