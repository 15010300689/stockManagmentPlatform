package com.stock.service;

import com.stock.entity.Role;
import com.stock.entity.User;
import com.stock.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    public Map<String, Object> getUsersByPage(String username, Integer pageNo, Integer pageSize) {
        int safePageNo = (pageNo == null || pageNo < 1) ? 1 : pageNo;
        int safePageSize = (pageSize == null || pageSize < 1) ? 10 : Math.min(pageSize, 100);
        String safeUsername = username == null ? null : username.trim();
        int offset = (safePageNo - 1) * safePageSize;

        int total = userMapper.countUsersByName(safeUsername);
        List<User> users = total <= 0
                ? Collections.emptyList()
                : userMapper.findUsersByNamePage(safeUsername, offset, safePageSize);

        List<Map<String, Object>> data = new ArrayList<>();
        for (User user : users) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", user.getId());
            row.put("userName", user.getUsername());
            row.put("createTime", user.getCreateTime());

            List<Role> roles = userMapper.findRolesByUserId(user.getId());
            List<Map<String, Object>> roleList = new ArrayList<>();
            if (roles != null) {
                for (Role role : roles) {
                    Map<String, Object> roleItem = new HashMap<>();
                    roleItem.put("id", role.getId());
                    roleItem.put("roleName", role.getRoleName());
                    roleList.add(roleItem);
                }
            }
            row.put("roleList", roleList);
            data.add(row);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("data", data);
        result.put("total", total);
        result.put("pageNo", safePageNo);
        result.put("pageSize", safePageSize);
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void createUser(String username, List<Long> roleIds) {
        String safeUsername = normalizeUsername(username);
        List<Long> safeRoleIds = normalizeRoleIds(roleIds);
        validateCreateOrUpdateRequest(null, safeUsername, safeRoleIds);

        User user = new User();
        user.setUsername(safeUsername);
        user.setPassword("123456");
        user.setStatus(1);
        int inserted = userMapper.insert(user);
        if (inserted <= 0 || user.getId() == null) {
            throw new IllegalStateException("新增用户失败");
        }
        saveUserRoles(user.getId(), safeRoleIds);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateUser(Long userId, String username, List<Long> roleIds) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("用户ID不能为空");
        }
        User existing = userMapper.findById(userId);
        if (existing == null) {
            throw new IllegalArgumentException("用户不存在");
        }

        String safeUsername = normalizeUsername(username);
        List<Long> safeRoleIds = normalizeRoleIds(roleIds);
        validateCreateOrUpdateRequest(userId, safeUsername, safeRoleIds);

        int updated = userMapper.updateUserBasic(userId, safeUsername);
        if (updated <= 0) {
            throw new IllegalStateException("更新用户失败");
        }
        saveUserRoles(userId, safeRoleIds);
    }

    private String normalizeUsername(String username) {
        return username == null ? "" : username.trim();
    }

    private List<Long> normalizeRoleIds(List<Long> roleIds) {
        if (roleIds == null) {
            return Collections.emptyList();
        }
        List<Long> safeRoleIds = new ArrayList<>();
        for (Long roleId : roleIds) {
            if (roleId != null && roleId > 0 && !safeRoleIds.contains(roleId)) {
                safeRoleIds.add(roleId);
            }
        }
        return safeRoleIds;
    }

    private void validateCreateOrUpdateRequest(Long userId, String username, List<Long> roleIds) {
        if (username == null || username.isEmpty()) {
            throw new IllegalArgumentException("用户名不能为空");
        }
        User conflict = userMapper.findByUsername(username);
        if (conflict != null && (userId == null || !conflict.getId().equals(userId))) {
            throw new IllegalArgumentException("用户名已存在");
        }
        if (roleIds == null || roleIds.isEmpty()) {
            throw new IllegalArgumentException("请至少选择一个角色");
        }
    }

    private void saveUserRoles(Long userId, List<Long> roleIds) {
        userMapper.deleteUserRoles(userId);
        for (Long roleId : roleIds) {
            userMapper.insertUserRole(userId, roleId);
        }
    }
}
