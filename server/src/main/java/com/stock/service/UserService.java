package com.stock.service;

import com.stock.entity.Role;
import com.stock.entity.User;
import com.stock.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
