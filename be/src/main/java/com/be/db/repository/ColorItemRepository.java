package com.be.db.repository;

import com.be.db.entity.ColorItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ColorItemRepository extends JpaRepository<ColorItem, Long> {

    // 특정 색상 중에서 하나를 랜덤으로 가져오기
    @Query(value = "SELECT * FROM color_item WHERE color = :color ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Optional<ColorItem> findRandomByColor(@Param("color") String color);

    // 특정 색상의 모든 데이터를 가져오기
    List<ColorItem> findByColor(String color);
}



