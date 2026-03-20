package com.stock.mapper;

import com.stock.entity.Inventory;
import com.stock.entity.InventoryLog;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface InventoryMapper {

    List<Inventory> findByProductId(@Param("productId") String productId);

    List<Inventory> findByProductAndWarehouse(@Param("productId") String productId,
                                              @Param("warehouseId") Integer warehouseId);

    Inventory findOne(@Param("productId") String productId,
                      @Param("warehouseId") Integer warehouseId,
                      @Param("positionId") Integer positionId);

    int insert(Inventory inventory);

    int updateQuantity(@Param("productId") String productId,
                       @Param("warehouseId") Integer warehouseId,
                       @Param("positionId") Integer positionId,
                       @Param("quantity") int quantity);

    int insertLog(InventoryLog log);
}
