package com.stock.controller;

import com.stock.dto.LoginRequest;
import com.stock.dto.Result;
import com.stock.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * 认证控制器：登录、登出、Token 验证
 */
@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * POST /api/login
     */
    @PostMapping("/login")
    public Object login(@RequestBody LoginRequest req) {
        if (req.getUsername() == null || req.getPassword() == null) {
            return Result.error("用户名和密码不能为空");
        }
        Map<String, Object> loginResult = authService.login(req.getUsername(), req.getPassword());
        if (loginResult != null) {
            return loginResult;
        }
        return Result.error("用户名或密码错误");
    }

    /**
     * POST /api/logout
     */
    @PostMapping("/logout")
    public Result logout() {
        return Result.ok("登出成功");
    }

    /**
     * GET /api/verify
     */
    @GetMapping("/verify")
    public Object verify(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        if (username == null) {
            return Result.error("Token无效或已过期");
        }
        Map<String, Object> result = authService.verify(username);
        if (result != null) {
            return result;
        }
        return Result.error("Token无效或已过期");
    }

    /**
     * GET /api/auth/permissions
     */
    @GetMapping("/auth/permissions")
    public Object getMyPermissions(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        if (username == null) {
            return Result.error("未登录或登录已过期");
        }
        return authService.getUserPermissionCodes(username);
    }
}
