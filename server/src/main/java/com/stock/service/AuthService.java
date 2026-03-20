package com.stock.service;

import com.stock.entity.Role;
import com.stock.entity.User;
import com.stock.mapper.PermissionMapper;
import com.stock.mapper.UserMapper;
import com.stock.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private PermissionMapper permissionMapper;

    /**
     * 用户登录
     * @return 包含 token、username、roleList 的 Map，失败返回 null
     */
    public Map<String, Object> login(String username, String password) {
        User user = userMapper.findByUsername(username);
        if (user == null || !user.getPassword().equals(password)) {
            return null;
        }

        // 查询角色列表
        List<Role> roles = userMapper.findRolesByUserId(user.getId());

        // 生成 JWT Token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        // 组装返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("token", token);
        result.put("username", user.getUsername());

        List<Map<String, Object>> roleList = new ArrayList<>();
        if (roles != null) {
            for (Role role : roles) {
                Map<String, Object> roleMap = new HashMap<>();
                roleMap.put("id", role.getId());
                roleMap.put("roleName", role.getRoleName());
                roleList.add(roleMap);
            }
        }
        result.put("roleList", roleList);
        result.put("permissionCodes", permissionMapper.findUserPermissionCodes(user.getId()));
        return result;
    }

    /**
     * 根据用户名获取用户及角色
     */
    public Map<String, Object> verify(String username) {
        User user = userMapper.findByUsername(username);
        if (user == null) {
            return null;
        }
        List<Role> roles = userMapper.findRolesByUserId(user.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("valid", true);
        result.put("username", user.getUsername());

        List<Map<String, Object>> roleList = new ArrayList<>();
        if (roles != null) {
            for (Role role : roles) {
                Map<String, Object> roleMap = new HashMap<>();
                roleMap.put("id", role.getId());
                roleMap.put("roleName", role.getRoleName());
                roleList.add(roleMap);
            }
        }
        result.put("roleList", roleList);
        result.put("permissionCodes", permissionMapper.findUserPermissionCodes(user.getId()));
        return result;
    }

    public List<String> getUserPermissionCodes(String username) {
        User user = userMapper.findByUsername(username);
        if (user == null) {
            return new ArrayList<>();
        }
        return permissionMapper.findUserPermissionCodes(user.getId());
    }
}
