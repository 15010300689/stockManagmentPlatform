package com.stock.controller;

import com.stock.dto.Result;
import com.stock.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public Object listUsers(@RequestParam(required = false) String userName,
                            @RequestParam(defaultValue = "1") Integer pageNo,
                            @RequestParam(defaultValue = "10") Integer pageSize) {
        return userService.getUsersByPage(userName, pageNo, pageSize);
    }

    @PostMapping("/user")
    public Result createUser(@RequestBody UserSaveRequest request) {
        try {
            userService.createUser(request.getUserName(), request.getRoleIds());
            return Result.ok("新增用户成功");
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("新增用户失败");
        }
    }

    @PutMapping("/user/{id}")
    public Result updateUser(@PathVariable Long id, @RequestBody UserSaveRequest request) {
        try {
            userService.updateUser(id, request.getUserName(), request.getRoleIds());
            return Result.ok("编辑用户成功");
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("编辑用户失败");
        }
    }

    public static class UserSaveRequest {
        private String userName;
        private List<Long> roleIds;

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public List<Long> getRoleIds() {
            return roleIds;
        }

        public void setRoleIds(List<Long> roleIds) {
            this.roleIds = roleIds;
        }
    }
}
