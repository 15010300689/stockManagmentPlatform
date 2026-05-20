package com.stock.mapper;

import com.stock.entity.Inventory;
import com.stock.entity.InventoryLog;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface InventoryMapper {

    List<Inventory> findByProductId(@Param("productId") Long productId);

    List<Inventory> findByProductAndWarehouse(@Param("productId") Long productId,
                                              @Param("warehouseId") Integer warehouseId);

    Inventory findOne(@Param("productId") Long productId,
                      @Param("warehouseId") Integer warehouseId,
                      @Param("positionId") Integer positionId);

    int insert(Inventory inventory);

    int updateQuantity(@Param("productId") Long productId,
                       @Param("warehouseId") Integer warehouseId,
                       @Param("positionId") Integer positionId,
                       @Param("quantity") int quantity);

    int insertLog(InventoryLog log);

    /** 删除某商品全部库存流水 */
    int deleteLogsByProductId(@Param("productId") Long productId);

    /** 删除某商品全部库存行 */
    int deleteInventoryByProductId(@Param("productId") Long productId);

    List<Inventory> findByWarehouseId(@Param("warehouseId") Integer warehouseId);

    List<Inventory> findByPositionId(@Param("positionId") Integer positionId);

    List<InventoryLog> findLogs(@Param("productId") Long productId,
                                @Param("warehouseId") Integer warehouseId,
                                @Param("positionId") Integer positionId,
                                @Param("limit") int limit);
}
