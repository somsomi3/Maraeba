package com.be.db.repository;

import com.be.db.entity.FoodGame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FoodGameRepository extends JpaRepository<FoodGame, Integer> {
    @Override
    <S extends FoodGame> S save(S entity);

    @Override
    Optional<FoodGame> findById(Integer integer);

    @Override
    void deleteById(Integer integer);

    FoodGame findByResultName(String name);

    @Query(value = "SELECT * FROM food_game ORDER BY RAND() LIMIT 1", nativeQuery = true)
    FoodGame findRandomFoodGame();
}
