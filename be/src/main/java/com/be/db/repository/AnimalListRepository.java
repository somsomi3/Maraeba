package com.be.db.repository;

import com.be.db.entity.AnimalGame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnimalListRepository extends JpaRepository<AnimalGame, Integer> {
}
