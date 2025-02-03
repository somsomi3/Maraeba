package com.be.db.repository;

import com.be.db.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Integer> {
    @Override
    <S extends FoodItem> S save(S entity);

    @Override
    Optional<FoodItem> findById(Integer integer);

    FoodItem findByIngredientName(String str);

    @Query(
            value = "SELECT ingredient_name " +
                    "FROM food_item " +
                    "WHERE ingredient_name NOT IN (:item1, :item2) " +
                    "ORDER BY RAND() " +
                    "LIMIT :limit",
            nativeQuery = true
    )
    List<String> findRandomFoodItems(@Param("limit") int limit, @Param("item1") String item1, @Param("item2") String item2);
}
