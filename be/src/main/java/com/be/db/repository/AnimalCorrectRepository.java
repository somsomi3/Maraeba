package com.be.db.repository;

import com.be.db.entity.AnimalCorrect;
import com.be.db.entity.AnimalCorrectId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnimalCorrectRepository extends JpaRepository<AnimalCorrect, AnimalCorrectId> {

    @Query("SELECT ac.locationX, ac.locationY " +
            "FROM AnimalCorrect ac " +
            "JOIN ac.animalList al " +
            "JOIN ac.animalGame ag " +
            "WHERE al.animalName = :animalName " +
            "AND ag.id = :gameId")
    List<Object[]> findLocationByAnimalNameAndGameId(@Param("animalName") String animalName,
                                                     @Param("gameId") Integer gameId);
    
    // game_id에 해당하는 모든 animal_name을 가져오는 쿼리
    @Query("SELECT a.animalName FROM AnimalList a " +
            "WHERE a.id IN (SELECT ac.animalId FROM AnimalCorrect ac WHERE ac.gameId = :gameId)")
    List<String> findAnimalNamesByGameId(@Param("gameId") Integer gameId);
}
