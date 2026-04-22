package com.stock.mapper;

import com.stock.entity.Role;
import com.stock.entity.User;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface UserMapper {

    User findByUsername(@Param("username") String username);

    User findById(@Param("id") Long id);

    List<User> findUsersByNamePage(@Param("username") String username,
                                   @Param("offset") int offset,
                                   @Param("limit") int limit);

    int countUsersByName(@Param("username") String username);

    List<Role> findRolesByUserId(@Param("userId") Long userId);

    int insert(User user);

    int updateUserBasic(@Param("id") Long id, @Param("username") String username);

    int deleteUserRoles(@Param("userId") Long userId);

    int insertUserRole(@Param("userId") Long userId, @Param("roleId") Long roleId);
}
