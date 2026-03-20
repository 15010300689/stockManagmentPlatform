package com.stock.mapper;

import com.stock.entity.Role;
import com.stock.entity.User;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface UserMapper {

    User findByUsername(@Param("username") String username);

    List<Role> findRolesByUserId(@Param("userId") Long userId);

    int insert(User user);
}
