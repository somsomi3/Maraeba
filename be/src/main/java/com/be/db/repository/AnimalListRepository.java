package com.be.db.repository;

import com.be.db.entity.AnimalGame;
import com.be.db.entity.AnimalList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnimalListRepository extends JpaRepository<AnimalList, Integer> {
}