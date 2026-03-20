package com.stock.mapper;

import com.stock.entity.Position;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface PositionMapper {

    List<Position> findByWarehouseId(@Param("warehouseId") Integer warehouseId);

    List<Position> findAll();

    Position findById(@Param("id") Integer id);
}
