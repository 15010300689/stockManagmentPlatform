package com.stock.mapper;

import com.stock.entity.Warehouse;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface WarehouseMapper {

    List<Warehouse> findAll();

    List<Warehouse> findPageByCondition(@Param("keyword") String keyword,
                                        @Param("status") String status,
                                        @Param("offset") int offset,
                                        @Param("limit") int limit);

    int countByCondition(@Param("keyword") String keyword, @Param("status") String status);

    Warehouse findById(@Param("id") Integer id);

    Warehouse findByCode(@Param("code") String code);

    int insert(Warehouse warehouse);

    int update(Warehouse warehouse);

    int deleteById(@Param("id") Integer id);
}
