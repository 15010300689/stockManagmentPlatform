package com.stock.mapper;

import com.stock.entity.Warehouse;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface WarehouseMapper {

    List<Warehouse> findAll();

    Warehouse findById(@Param("id") Integer id);

    Warehouse findByCode(@Param("code") String code);

    int insert(Warehouse warehouse);

    int update(Warehouse warehouse);

    int deleteById(@Param("id") Integer id);
}
