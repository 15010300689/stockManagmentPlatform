package com.stock.mapper;

import com.stock.entity.Product;
import org.apache.ibatis.annotations.Param;
import java.math.BigDecimal;
import java.util.List;

public interface ProductMapper {

    List<Product> findAll();

    List<Product> findPage(@Param("name") String name,
                           @Param("category") String category,
                           @Param("offset") int offset,
                           @Param("limit") int limit);

    int countByCondition(@Param("name") String name, @Param("category") String category);

    List<Product> findByName(@Param("name") String name);

    List<Product> findByCategory(@Param("category") String category);

    Product findById(@Param("id") Long id);

    /** 名称完全一致（用于唯一性校验，入参需已 trim） */
    Product findByExactName(@Param("name") String name);

    /** 是否存在同名其他商品（编辑时用） */
    int countByNameExceptId(@Param("name") String name, @Param("id") Long id);

    int insert(Product product);

    int update(Product product);

    int deleteById(@Param("id") Long id);

    /** 库存增减 */
    int addQuantity(@Param("id") Long id, @Param("amount") int amount);

    int reduceQuantity(@Param("id") Long id, @Param("amount") int amount);

    /** 统计 */
    int countAll();

    BigDecimal sumTotalValue();

    List<String> findAllCategories();

    List<Product> findLowStock(@Param("threshold") int threshold);
}
