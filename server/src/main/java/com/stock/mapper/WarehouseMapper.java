package com.stock.mapper;

import com.stock.entity.Warehouse;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface WarehouseMapper {

    List<Warehouse> findAll();

    Warehouse findById(@Param("id") Integer id);
}
