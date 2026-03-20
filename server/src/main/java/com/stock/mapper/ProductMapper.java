package com.stock.mapper;

import com.stock.entity.Product;
import org.apache.ibatis.annotations.Param;
import java.math.BigDecimal;
import java.util.List;

public interface ProductMapper {

    List<Product> findAll();

    List<Product> findByName(@Param("name") String name);

    List<Product> findByCategory(@Param("category") String category);

    Product findById(@Param("id") String id);

    int insert(Product product);

    int update(Product product);

    int deleteById(@Param("id") String id);

    /** 库存增减 */
    int addQuantity(@Param("id") String id, @Param("amount") int amount);

    int reduceQuantity(@Param("id") String id, @Param("amount") int amount);

    /** 统计 */
    int countAll();

    BigDecimal sumTotalValue();

    List<String> findAllCategories();

    List<Product> findLowStock(@Param("threshold") int threshold);
}
