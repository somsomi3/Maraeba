package com.be.db.repository;

import com.be.db.entity.AnimalGame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AnimalGameRepository extends JpaRepository<AnimalGame, Integer> {
    @Query(value = "SELECT * FROM animal_game ORDER BY RAND() LIMIT 1", nativeQuery = true)
    AnimalGame findRandomAnimalGame();
}
